import { Platform } from 'react-native';
import { open } from '@op-engineering/op-sqlite';

/**
 * The app's SQLite database.
 *
 * Opens the same `tv.db` file the previous SQLite library (react-native-sqlite-storage)
 * wrote, so favorites saved before the upgrade carry over:
 *   iOS:     Library/LocalDatabase/tv.db
 *   Android: <app>/databases/tv.db
 */
let db = null;

export function getDb() {
  if (!db) {
    const options = { name: 'tv.db' };
    if (Platform.OS === 'ios') {
      options.location = 'LocalDatabase';
    }
    db = open(options);
    db.executeSync('CREATE TABLE IF NOT EXISTS favorites (title TEXT PRIMARY KEY);');
    db.executeSync('CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);');
  }
  return db;
}
