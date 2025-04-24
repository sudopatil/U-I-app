
// server/services/registration.service.js

import { db, users, couples } from '../database/schema/index.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { and, eq } from 'drizzle-orm';


const ONE_YEAR = 365 * 24 * 60 * 60 * 1000;
const SALT_ROUNDS = 10;

const loginUrl = `${process.env.CLIENT_URL}/login`;

const verificationEmailTemplate = (firstName, verifyUrl) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        .email-container { max-width: 600px; margin: auto; padding: 20px; 
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
        .header { color: #2b6cb0; font-size: 26px; text-align: center; 
                padding: 20px 0; border-bottom: 2px solid #e2e8f0; }
        .content { margin: 25px 0; line-height: 1.6; color: #4a5568; }
        .button { background: #2b6cb0; color: white !important; padding: 14px 28px;
                text-decoration: none; border-radius: 6px; display: inline-block;
                font-weight: 500; margin: 20px 0; transition: opacity 0.3s; }
        .button:hover { opacity: 0.9; }
        .footer { margin-top: 30px; font-size: 0.9em; color: #718096;
                text-align: center; }
        .code { background: #f8fafc; padding: 12px; border-radius: 4px;
                word-break: break-all; margin: 15px 0; }
        .notice { color: #718096; font-size: 0.9em; margin-top: 25px; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">Welcome to U&I! 🌟</div>
        <div class="content">
            <p>Hi ${firstName},</p>
            <p>We're excited to have you on board! To get started, please verify your email address:</p>
            
            <div style="text-align: center;">
                <a href="${verifyUrl}" class="button">Verify Email Address</a>
            </div>

            <p>Or copy this link to your browser:</p>
            <div class="code">${verifyUrl}</div>
            
            <p class="notice">This verification link will expire in 1 year.</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>The U&I Team</p>
            <p style="margin-top: 15px;">Need help? Contact us at 
                <a href="mailto:support@uandi.com">support@uandi.com</a></p>
        </div>
    </div>
</body>
</html>
`;

// verificationTemplate.js
const {
  LOGIN_URL = 'http://localhost:5050/login', // fallback for local dev
} = process.env;

export const verificationPageTemplate = (message, isSuccess) => `
<!DOCTYPE html>
<html>
<head>
    <title>Email Verification</title>
    <style>
        body { font-family: 'Segoe UI', system-ui, sans-serif;
            background: #f8fafc; margin: 0; padding: 2rem; }
        .container { max-width: 800px; margin: 3rem auto; padding: 2.5rem;
            background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            text-align: center; }
        .icon { font-size: 4rem; margin-bottom: 1.5rem; }
        .success { color: #2b6cb0; border: 2px solid #bee3f8; }
        .error { color: #e53e3e; border: 2px solid #fed7d7; }
        .message { font-size: 1.2rem; line-height: 1.6; margin: 1.5rem 0; }
        .button { background: #2b6cb0; color: white; padding: 12px 24px;
                text-decoration: none; border-radius: 6px; display: inline-block;
                margin-top: 1.5rem; }
    </style>
</head>
<body>
    <div class="container ${isSuccess ? 'success' : 'error'}">
        <div class="icon">${isSuccess ? '✅' : '⚠️'}</div>
        <h1>${isSuccess ? 'Verification Successful!' : 'Verification Failed'}</h1>
        <div class="message">${message}</div>
        ${isSuccess
          ? `<a href="${LOGIN_URL}" class="button">Continue to Login</a>`
          : `<a href="/support" class="button">Get Help</a>`
        }
    </div>
</body>
</html>
`;


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


export async function registerUser(payload) {
  console.log('registerUser: Received payload:', payload);

  try {
    const {
      email,
      password,        // plaintext password
      firstName,
      dateOfBirth,
      gender,
      role,            // 'girlfriend' or 'boyfriend'
      isFirstPartner,  // boolean
      invitationToken, // only for second partner
    } = payload;

    if (!password) {
      console.error('registerUser: Password is missing in payload');
      throw new Error('Password is required');
    }

    // 1) Hash the password
    console.log('registerUser: Hashing password');
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // 2) Create verification token + expiry
    const verificationToken = generateVerificationToken();
    const verificationExpiresAt = new Date(Date.now() + ONE_YEAR);

    // 3) If second partner: find the couple & enforce opposite roles
    let coupleId = null;

    if (!isFirstPartner) {
      if (!invitationToken) {
        return { status: 400, message: 'Missing invitation code.' };
      }

      console.log('registerUser: Looking up couple for token:', invitationToken);
      const found = await db
        .select()
        .from(couples)
        .where(
          and(
            eq(couples.invitationToken, invitationToken),
            eq(couples.verificationStatus, 'pending')
          )
        )
        .limit(1);

      const foundCouple = found[0];
      if (!foundCouple) {
        console.error('registerUser: Invalid or expired invitation code');
        return { status: 400, message: 'Invalid or expired invitation code.' };
      }

      coupleId = foundCouple.id;
      console.log('registerUser: Couple found. id =', coupleId);

      // fetch first partner's role
      const firstRows = await db
        .select({ role: users.role })
        .from(users)
        .where(
          and(
            eq(users.couple_id, coupleId),
            eq(users.is_first_partner, true)
          )
        )
        .limit(1);

      if (!firstRows.length) {
        console.error('registerUser: No first-partner user found');
        return { status: 400, message: 'Invalid invitation data.' };
      }

      const firstRole = firstRows[0].role;
      console.log('registerUser: First partner role is', firstRole);

      if (firstRole === role) {
        console.error(
          `registerUser: Role conflict—partner is "${firstRole}", new user tried "${role}"`
        );
        return {
          status: 400,
          message: `Your role must be opposite of your partner’s. They’re "${firstRole}".`
        };
      }
    }

    // 4) Insert the new user
    let insertedId = null;
    await db.transaction(async tx => {
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

      // extract the inserted ID
      if (Array.isArray(insertResult)) {
        insertedId = insertResult[0]?.insertId || null;
      } else if (insertResult.insertId != null) {
        insertedId = insertResult.insertId;
      }
    });

    // 5) Send verification email
    const verifyUrl = `${process.env.APP_URL}/api/verify?userId=${insertedId}&token=${verificationToken}`;
    console.log('registerUser: Sending verification email to:', email, 'URL:', verifyUrl);
    await transporter.sendMail({
      from: `"U&I Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your U&I Account',
      html: verificationEmailTemplate(firstName, verifyUrl),
      text: `Verify your email: ${verifyUrl}\nThis link expires in 1 year.`
    });

    console.log('registerUser: Registration & email dispatch complete');
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

// export async function verifyUser(userId, token) {
//   console.log('verifyUser: Received userId:', userId, 'and token:', token);

//   try {
//     return await db.transaction(async (tx) => {
//       // --- PHASE 1: Retrieve and validate user ---
//       const userArray = await tx.select()
//         .from(users)
//         .where(eq(users.id, Number(userId)));
      
//       console.log('verifyUser: Retrieved user array:', userArray);
//       const foundUser = userArray[0];

//       if (!foundUser) throw new Error('User not found');
//       if (foundUser.verified) throw new Error('User already verified');
//       if (foundUser.verification_token !== token) throw new Error('Invalid token');
//       if (foundUser.verification_expires_at < new Date()) throw new Error('Token expired');

//       // --- PHASE 2: Mark user as verified ---
//       console.log('verifyUser: Marking user as verified');
//       await tx.update(users)
//         .set({
//           verified: true,
//           verification_token: null,
//           verification_expires_at: null,
//         })
//         .where(eq(users.id, foundUser.id));

//       // --- PHASE 3: Handle couple verification ---
//       if (foundUser.is_first_partner && !foundUser.couple_id) {
//         console.log('verifyUser: Creating new couple for first partner');
//         const invitationCode = generateInvitationCode();

//         // Insert new couple
//         await tx.insert(couples).values({
//           verificationStatus: 'pending',
//           invitationToken: invitationCode,
//         });

//         // Retrieve newly created couple
//         const [newCouple] = await tx.select()
//           .from(couples)
//           .where(and(
//             eq(couples.invitationToken, invitationCode),
//             eq(couples.verificationStatus, 'pending')
//           ))
//           .limit(1);

//         if (!newCouple) throw new Error('Couple creation failed');

//         // Link user to couple
//         await tx.update(users)
//           .set({ couple_id: newCouple.id })
//           .where(eq(users.id, foundUser.id));

//         // Send invitation email
//         await transporter.sendMail({
//           from: process.env.EMAIL_USER,
//           to: foundUser.email,
//           subject: 'U&I - Partner Invitation Code',
//           html: `Your invitation code: ${invitationCode}`
//         });

//         return {
//           status: 200,
//           message: `Verification complete. Invitation code sent to ${foundUser.email}`
//         };
//       }

//       if (!foundUser.is_first_partner && foundUser.couple_id) {
//         console.log('verifyUser: Finalizing couple verification');
//         const updateResult = await tx.update(couples)
//           .set({ verificationStatus: 'verified' })
//           .where(eq(couples.id, foundUser.couple_id));

//         if (updateResult.rowsAffected === 0) {
//           throw new Error('Couple verification failed');
//         }

//         return {
//           status: 200,
//           message: 'Couple verification completed successfully'
//         };
//       }

//       // Default return for non-coupled users
//       return { status: 200, message: 'Email verification completed' };
//     });
//   } catch (error) {
//     console.error('Error in verifyUser:', error);
//     return {
//       status: error.code === 'ER_PARSE_ERROR' ? 400 : 500,
//       message: 'Verification failed: ' + error.message,
//       error: error.message
//     };
//   }
// }

export async function verifyUser(userId, token) {
  console.log('verifyUser: Received userId:', userId, 'and token:', token);

  try {
    return await db.transaction(async (tx) => {
      // --- PHASE 1: Fetch and validate user ---
      const [foundUser] = await tx.select()
        .from(users)
        .where(eq(users.id, Number(userId)));

      if (!foundUser) {
        throw new Error('User not found');
      }

      if (foundUser.verified) {
        return {
          status: 200,
          message: 'Account is already verified',
        };
      }

      if (foundUser.verification_token !== token) {
        throw new Error('Invalid verification token');
      }

      if (foundUser.verification_expires_at < new Date()) {
        throw new Error('Verification token has expired');
      }

      // --- PHASE 2: Mark user as verified ---
      await tx.update(users)
        .set({
          verified: true,
          verification_token: null,
          verification_expires_at: null,
        })
        .where(eq(users.id, foundUser.id));

      let responseMessage = 'Email verification completed';

      // --- PHASE 3: Handle couple logic ---
      if (foundUser.is_first_partner && !foundUser.couple_id) {
        console.log('Creating new couple for first partner');
        const invitationCode = generateInvitationCode();

        // Insert couple
        await tx.insert(couples).values({
          verificationStatus: 'pending',
          invitationToken: invitationCode,
        });

        // Retrieve inserted couple
        const [newCouple] = await tx.select()
          .from(couples)
          .where(and(
            eq(couples.invitationToken, invitationCode),
            eq(couples.verificationStatus, 'pending')
          ))
          .limit(1);

        if (!newCouple) {
          throw new Error('Failed to create couple relationship');
        }

        // Link user to couple
        await tx.update(users)
          .set({ couple_id: newCouple.id })
          .where(eq(users.id, foundUser.id));

        // Send email
        await transporter.sendMail({
          from: `"U&I" <${process.env.EMAIL_USER}>`,
          to: foundUser.email,
          subject: 'U&I - Partner Invitation Code',
          html: `<p>Your invitation code is: <strong>${invitationCode}</strong></p>`,
        });

        responseMessage = `Verification complete. Invitation code sent to ${foundUser.email}`;
      }

      if (!foundUser.is_first_partner && foundUser.couple_id) {
        const result = await tx.update(couples)
          .set({ verificationStatus: 'verified' })
          .where(eq(couples.id, foundUser.couple_id));

        if (result.rowsAffected === 0) {
          throw new Error('Failed to update couple verification status');
        }

        responseMessage = 'Couple verification completed successfully';
      }

      return {
        status: 200,
        message: responseMessage,
      };
    });
  } catch (error) {
    console.error('❌ Error in verifyUser:', error);
    return {
      status: error.message.includes('Invalid') || error.message.includes('expired') ? 400 : 500,
      message: 'Verification failed: ' + error.message,
      error: error.message,
    };
  }
}
