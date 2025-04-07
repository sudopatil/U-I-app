
// server/services/registration.service.js

import { db, users, couples } from '../database/schema/index.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { and, eq } from 'drizzle-orm';


const ONE_YEAR = 365 * 24 * 60 * 60 * 1000;
const SALT_ROUNDS = 10;

// Set up Nodemailer (Gmail + App Password recommended)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper: Generate a random verification token
function generateVerificationToken() {
  const token = crypto.randomBytes(16).toString('hex');
  console.log('Generated verification token:', token);
  return token;
}

// Helper: Generate a 6-digit numeric invitation code
function generateInvitationCode() {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  console.log('Generated invitation code:', code);
  return code;
}

/**
 * registerUser
 * Expects payload to include:
 * - email
 * - password (plaintext; will be hashed)
 * - firstName
 * - dateOfBirth
 * - gender
 * - role
 * - isFirstPartner (boolean)
 * - invitationToken (only for second partner)
 */
export async function registerUser(payload) {
  console.log('registerUser: Received payload:', payload);

  try {
    const {
      email,
      password, // plaintext password
      firstName,
      dateOfBirth,
      gender,
      role,
      isFirstPartner,
      invitationToken, // only for second partner
    } = payload;

    if (!password) {
      console.error('registerUser: Password is missing in payload');
      throw new Error('Password is required');
    }

    console.log('registerUser: Hashing password');
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    console.log('registerUser: Password hashed:', passwordHash);

    const verificationToken = generateVerificationToken();
    const verificationExpiresAt = new Date(Date.now() + ONE_YEAR);
    console.log('registerUser: Verification expires at:', verificationExpiresAt);

    let coupleId = null;
    if (!isFirstPartner) {
      console.log('registerUser: Looking up couple with invitation token:', invitationToken);
      
      const foundCoupleArray = await db
        .select()
        .from(couples)
        .where(
          and(
            eq(couples.invitationToken, invitationToken), // Fixed variable name
            eq(couples.verificationStatus, 'pending')
          )
        )
        .limit(1);

      console.log('registerUser: Found couple array:', foundCoupleArray);
      const foundCouple = foundCoupleArray[0];

      if (!foundCouple) {
        console.error('registerUser: No couple found for token:', invitationToken);
        return { status: 400, message: 'Invalid or expired invitation code.' };
      }
      coupleId = foundCouple.id;
      console.log('registerUser: Couple found. couple_id:', coupleId);
    }

    let insertedUser;
    let insertedId = null;
    await db.transaction(async (tx) => {
      console.log('registerUser: Inserting user into the database');
      const insertResult = await tx.insert(users).values({
        email,
        password_hash: passwordHash,
        first_name: firstName,
        date_of_birth: dateOfBirth,
        gender,
        role,
        is_first_partner: isFirstPartner,
        couple_id: coupleId,
        verification_token: verificationToken,
        verification_expires_at: verificationExpiresAt,
        verified: false,
      });
      console.log('registerUser: Insert result:', insertResult);
      
      // Try extracting insertId; adjust based on your insertResult structure.
      
      if (Array.isArray(insertResult)) {
        insertedId = insertResult[0]?.insertId;
      } else if (insertResult && typeof insertResult.insertId !== 'undefined') {
        insertedId = insertResult.insertId;
      }
      console.log('registerUser: Retrieved insertId:', insertedId);

      // if (!insertedId) {
      //   console.warn('insertedId is undefined; falling back to query by email');
      //   const userArray = await tx.select().from(users).where(users.email, '=', email);
      //   insertedUser = userArray[insertedId];
      // } else {
      //   const userArray = await tx.select().from(users).where(users.id, '=', insertedId);
      //   insertedUser = userArray[insertedId];
      // }
      // console.log('registerUser: Inserted user retrieved:', insertedUser);
      // if (!insertedUser) {
      //   throw new Error('User insert failed: No user returned after insert');
      // }
    });


    const verifyUrl = `${process.env.APP_URL}/api/verify?userId=${insertedId}&token=${verificationToken}`;
    console.log('registerUser: Sending verification email to:', email, 'with URL:', verifyUrl);
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'U&I - Verify Your Email',
      html: `
        <h2>Welcome to U&I!</h2>
        <p>Please click the link below to verify your email:</p>
        <a href="${verifyUrl}">Verify Email</a>
      `,
    });
    console.log('registerUser: Verification email sent successfully');

    return {
      status: 200,
      message: 'Registration successful. Check your email to verify.',
      data: { userId: insertedId },
    };
  } catch (error) {
    console.error('Error in registerUser:', error);
    return {
      status: 500,
      message: 'Server error during registration',
      error: error.message,
    };
  }
}

/**
 * verifyUser
 * - Checks user by userId and token.
 * - If valid, sets verified = true.
 * - If user isFirstPartner = true, creates a couples record with a 6-digit invitation code.
 * - If user isFirstPartner = false, and they are verified, updates the couples row to 'verified'.
 */

export async function verifyUser(userId, token) {
  console.log('verifyUser: Received userId:', userId, 'and token:', token);

  try {
    return await db.transaction(async (tx) => {
      // --- PHASE 1: Retrieve and validate user ---
      const userArray = await tx.select()
        .from(users)
        .where(eq(users.id, Number(userId)));
      
      console.log('verifyUser: Retrieved user array:', userArray);
      const foundUser = userArray[0];

      if (!foundUser) throw new Error('User not found');
      if (foundUser.verified) throw new Error('User already verified');
      if (foundUser.verification_token !== token) throw new Error('Invalid token');
      if (foundUser.verification_expires_at < new Date()) throw new Error('Token expired');

      // --- PHASE 2: Mark user as verified ---
      console.log('verifyUser: Marking user as verified');
      await tx.update(users)
        .set({
          verified: true,
          verification_token: null,
          verification_expires_at: null,
        })
        .where(eq(users.id, foundUser.id));

      // --- PHASE 3: Handle couple verification ---
      if (foundUser.is_first_partner && !foundUser.couple_id) {
        console.log('verifyUser: Creating new couple for first partner');
        const invitationCode = generateInvitationCode();

        // Insert new couple
        await tx.insert(couples).values({
          verificationStatus: 'pending',
          invitationToken: invitationCode,
        });

        // Retrieve newly created couple
        const [newCouple] = await tx.select()
          .from(couples)
          .where(and(
            eq(couples.invitationToken, invitationCode),
            eq(couples.verificationStatus, 'pending')
          ))
          .limit(1);

        if (!newCouple) throw new Error('Couple creation failed');

        // Link user to couple
        await tx.update(users)
          .set({ couple_id: newCouple.id })
          .where(eq(users.id, foundUser.id));

        // Send invitation email
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: foundUser.email,
          subject: 'U&I - Partner Invitation Code',
          html: `Your invitation code: ${invitationCode}`
        });

        return {
          status: 200,
          message: `Verification complete. Invitation code sent to ${foundUser.email}`
        };
      }

      if (!foundUser.is_first_partner && foundUser.couple_id) {
        console.log('verifyUser: Finalizing couple verification');
        const updateResult = await tx.update(couples)
          .set({ verificationStatus: 'verified' })
          .where(eq(couples.id, foundUser.couple_id));

        if (updateResult.rowsAffected === 0) {
          throw new Error('Couple verification failed');
        }

        return {
          status: 200,
          message: 'Couple verification completed successfully'
        };
      }

      // Default return for non-coupled users
      return { status: 200, message: 'Email verification completed' };
    });
  } catch (error) {
    console.error('Error in verifyUser:', error);
    return {
      status: error.code === 'ER_PARSE_ERROR' ? 400 : 500,
      message: 'Verification failed: ' + error.message,
      error: error.message
    };
  }
}