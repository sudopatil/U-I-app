import { mysqlTable, int, varchar, mysqlEnum, timestamp } from 'drizzle-orm/mysql-core';

export const couples = mysqlTable('couples', {
  id: int('id').primaryKey().autoincrement(),
  verificationStatus: mysqlEnum('verification_status', ['pending', 'verified']).default('pending'),
  invitationToken: varchar('invitation_token', { length: 255 }).unique(),
  createdAt: timestamp('created_at').default(new Date().toISOString()),
});
