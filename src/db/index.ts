import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';

import * as schema from './schema';

export const expoSqliteDb = SQLite.openDatabaseSync('db.db', {
  enableChangeListener: true,
});
export const db = drizzle(expoSqliteDb, { schema });
