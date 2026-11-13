import { useCallback, useEffect, useRef, useState } from 'react';
import { addFavorite, loadFavoriteTitles, removeFavorite } from '../db/favorites';

/**
 * Favorite channel titles as a Set, persisted to SQLite.
 * Toggles update the UI immediately and write to the database in the background.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState(() => new Set());
  const current = useRef(favorites);

  useEffect(() => {
    try {
      const saved = new Set(loadFavoriteTitles());
      current.current = saved;
      setFavorites(saved);
    } catch (error) {
      console.warn('Could not load favorites', error);
    }
  }, []);

  const toggleFavorite = useCallback(channel => {
    const title = channel.title;
    const next = new Set(current.current);
    const adding = !next.has(title);
    if (adding) {
      next.add(title);
    } else {
      next.delete(title);
    }
    current.current = next;
    setFavorites(next);

    try {
      if (adding) {
        addFavorite(title);
      } else {
        removeFavorite(title);
      }
    } catch (error) {
      console.warn('Could not save favorite', error);
    }
    return adding;
  }, []);

  return { favorites, toggleFavorite };
}
