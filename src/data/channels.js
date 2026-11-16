import { channels as rawChannels } from '../../channels';

/** Known categories keep this order in the filter chips; any others follow alphabetically. */
const PREFERRED_ORDER = ['Music', 'News', 'Movies', 'Religious'];

/**
 * Channel list from the git-ignored `channels.js`, normalized so every entry
 * has a unique `key` (used for list rendering) and a `group`.
 * Favorites are still keyed by `title`, as before.
 */
export const channels = (Array.isArray(rawChannels) ? rawChannels : [])
  .filter(channel => channel && channel.title)
  .map((channel, index) => ({
    ...channel,
    key: String(channel.id ?? `${channel.title}-${index}`),
    group: channel.group || 'Other',
  }));

const rank = group => {
  const index = PREFERRED_ORDER.indexOf(group);
  return index === -1 ? PREFERRED_ORDER.length : index;
};

/** 'All' plus every category present in the data. */
export const categories = [
  'All',
  ...[...new Set(channels.map(channel => channel.group))].sort(
    (a, b) => rank(a) - rank(b) || a.localeCompare(b),
  ),
];

/** Shown in the hero carousel until the user has favorites. */
export const featuredChannels = channels.slice(0, 8);

export function filterChannels(list, query, group) {
  const needle = query.trim().toLowerCase();
  return list.filter(channel => {
    const matchGroup = group === 'All' || channel.group === group;
    if (!matchGroup) {
      return false;
    }
    if (!needle) {
      return true;
    }
    return (
      channel.title.toLowerCase().includes(needle) ||
      channel.group.toLowerCase().includes(needle)
    );
  });
}
