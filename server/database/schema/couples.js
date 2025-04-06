const { mysqlTable, int, varchar, mysqlEnum, timestamp } = require('drizzle-orm/mysql-core');

const couples = mysqlTable('couples', {
  id: int('id').primaryKey().autoincrement(),
  verificationStatus: mysqlEnum('verification_status', ['pending', 'verified']).default('pending'),
  invitationToken: varchar('invitation_token', { length: 255 }).unique(),
  // Consider using a dynamic default if available
  createdAt: timestamp('created_at').default(new Date().toISOString()),
});

module.exports = { couples };
