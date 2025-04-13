import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { eq, ne, and } from 'drizzle-orm';
import { db, users } from '../database/schema/index.js';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Logs in a user by verifying credentials and generating a JWT.
 * Also retrieves the partner details if available.
 *
 * @param {string} email - The user's email.
 * @param {string} password - The plaintext password.
 * @returns {Promise<object>} An object containing the JWT token, user details, and partner details.
 */
export const loginService = async (email, password) => {
  console.log('🔐 Attempting login for email:', email);

  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!userResult || userResult.length === 0) {
    console.log('❌ User not found for email:', email);
    throw new Error('Invalid email or password');
  }

  const userRecord = userResult[0];
  //console.log('✅ User found:', userRecord);

  if (!userRecord.verified) {
    console.log('⚠️ User not verified:', userRecord.email);
    throw new Error('User is not verified');
  }

  const passwordValid = await bcrypt.compare(password, userRecord.password_hash);
  if (!passwordValid) {
    console.log('❌ Invalid password for:', email);
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign(
    { id: userRecord.id, email: userRecord.email },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  let partner = null;
  if (userRecord.couple_id) {
   // console.log('🔎 Looking for partner with couple_id:', userRecord.couple_id);

    // const partnerResult = await db
    //   .select()
    //   .from(users)
    //   .where(eq(users.couple_id, userRecord.couple_id))
    //   .where(ne(users.id, userRecord.id))
    //   .limit(1);

    const partnerResult = await db
        .select()
        .from(users)
        .where(
            and(
            eq(users.couple_id, userRecord.couple_id),
            ne(users.id, userRecord.id)
            )
        )
        .limit(1);

   // console.log('👀 Partner query result:', partnerResult);

    if (partnerResult.length) {
      partner = partnerResult[0];
      //console.log('✅ Partner found:', partner);
    } else {
      console.log('⚠️ No partner found with couple_id:', userRecord.couple_id);
    }
  } else {
    console.log('⚠️ User has no couple_id');
  }

  return {
    token,
    user: {
      id: userRecord.id,
      email: userRecord.email,
      first_name: userRecord.first_name,
      role: userRecord.role,
      couple_id: userRecord.couple_id,
      is_first_partner: userRecord.is_first_partner,
      date_of_birth: userRecord.date_of_birth,
      gender: userRecord.gender,
      profile_pic: userRecord.profile_pic,
    },
    partner: partner
      ? {
          id: partner.id,
          email: partner.email,
          first_name: partner.first_name,
          role: partner.role,
          couple_id: partner.couple_id,
          is_first_partner: partner.is_first_partner,
          date_of_birth: partner.date_of_birth,
          gender: partner.gender,
          profile_pic: partner.profile_pic,
        }
      : null,
  };
};
