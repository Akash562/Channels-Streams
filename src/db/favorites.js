import { Platform } from 'react-native';
import { open } from '@op-engineering/op-sqlite';

/**
 * Favorites storage.
 *
 * Opens the same `tv.db` file the previous SQLite library (react-native-sqlite-storage)
 * wrote, with the same table, so favorites saved before the upgrade carry over:
 *   iOS:     Library/LocalDatabase/tv.db
 *   Android: <app>/databases/tv.db
 */
let db = null;

function getDb() {
  if (!db) {
    const options = { name: 'tv.db' };
    if (Platform.OS === 'ios') {
      options.location = 'LocalDatabase';
    }
    db = open(options);
    db.executeSync('CREATE TABLE IF NOT EXISTS favorites (title TEXT PRIMARY KEY);');
  }
  return db;
}

export function loadFavoriteTitles() {
  const { rows } = getDb().executeSync('SELECT title FROM favorites');
  return rows.map(row => String(row.title));
}

export function addFavorite(title) {
  getDb().executeSync('INSERT OR IGNORE INTO favorites (title) VALUES (?)', [title]);
}

export function removeFavorite(title) {
  getDb().executeSync('DELETE FROM favorites WHERE title = ?', [title]);
}
