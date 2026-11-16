import { getDb } from './database';

/** Favorite channels, keyed by channel title (same table as before the upgrade). */

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
