import { Clapperboard, Disc3, LayoutGrid, Newspaper, Sparkles, Tv } from './icons';

const ICONS = {
  All: LayoutGrid,
  Music: Disc3,
  News: Newspaper,
  Movies: Clapperboard,
  Religious: Sparkles,
};

/** Icon component for a category chip; unknown categories get a TV icon. */
export function categoryIcon(group) {
  return ICONS[group] || Tv;
}
