import { getDb } from './database';

/** Small key/value store for app preferences (for example the theme). */

export function getSetting(key) {
  const { rows } = getDb().executeSync('SELECT value FROM settings WHERE key = ?', [key]);
  return rows.length ? String(rows[0].value) : null;
}

export function setSetting(key, value) {
  getDb().executeSync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
}
