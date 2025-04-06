const { mysqlTable, int, boolean, varchar, mysqlEnum, date, datetime } = require('drizzle-orm/mysql-core');
const { couples } = require('./couples.js');

const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  couple_id: int('couple_id').references(() => couples.id),
  is_first_partner: boolean('is_first_partner').default(false),
  role: mysqlEnum('role', ['girlfriend', 'boyfriend']).notNull(),
  email: varchar('email', { length: 100 }).unique().notNull(),
  password_hash: varchar('password_hash', { length: 255 }).notNull(),
  first_name: varchar('first_name', { length: 50 }).notNull(),
  date_of_birth: date('date_of_birth'),
  gender: mysqlEnum('gender', ['male', 'female', 'other']),
  profile_pic: varchar('profile_pic', { length: 255 }),
  verification_token: varchar('verification_token', { length: 255 }),
  verification_expires_at: datetime('verification_expires_at'),
  verified: boolean('verified').default(false),
  // Consider using a dynamic default if available (e.g., .defaultNow())
  created_at: datetime('created_at').default(new Date().toISOString()),
});

module.exports = { users };
