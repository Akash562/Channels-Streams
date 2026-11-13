import React, { memo, useCallback, useDeferredValue, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heart, Sparkles } from '../components/icons';

import { AuroraBackground } from '../components/AuroraBackground';
import { CategoryChips } from '../components/CategoryChips';
import { ChannelCard } from '../components/ChannelCard';
import { FeaturedCarousel } from '../components/FeaturedCarousel';
import { CompactHeader, EmptyState, HeroHeader, SectionHeader } from '../components/HomeHeader';
import { SearchBar } from '../components/SearchBar';
import { categoryIcon } from '../components/categoryIcon';
import { categories, channels, featuredChannels, filterChannels } from '../data/channels';
import { useFavorites } from '../hooks/useFavorites';
import { PlayerModal } from '../player/PlayerModal';
import { space } from '../theme/tokens';

/**
 * Everything above the channel grid. It is a stable top-level component
 * passed to the list as an element, so the search field keeps focus while
 * results update.
 */
const ListHeader = memo(function ListHeader({
  scrollY,
  search,
  onSearch,
  group,
  onGroup,
  rail,
  onOpenFromRail,
  gridTitle,
  gridCount,
}) {
  return (
    <View>
      <HeroHeader scrollY={scrollY} channelCount={channels.length} />

      <Animated.View entering={FadeInDown.delay(80).springify().damping(18)} style={styles.search}>
        <SearchBar value={search} onChangeText={onSearch} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(150).springify().damping(18)}>
        <CategoryChips categories={categories} active={group} onChange={onGroup} />
      </Animated.View>

      {!search && rail.data.length > 0 && (
        <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(180)}>
          <SectionHeader
            icon={rail.isFavorites ? Heart : Sparkles}
            title={rail.title}
            meta={rail.isFavorites ? `${rail.data.length} saved` : null}
          />
          <FeaturedCarousel data={rail.data} onSelect={onOpenFromRail} />
        </Animated.View>
      )}

      <SectionHeader icon={categoryIcon(group)} title={gridTitle} meta={`${gridCount}`} />
    </View>
  );
});

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [group, setGroup] = useState('All');
  const { favorites, toggleFavorite } = useFavorites();
  const [player, setPlayer] = useState(null); // { channel, playlist }

  const filtered = useMemo(
    () => filterChannels(channels, deferredSearch, group),
    [deferredSearch, group],
  );
  const filteredRef = useRef(filtered);
  filteredRef.current = filtered;

  const favoriteChannels = useMemo(
    () => channels.filter(channel => favorites.has(channel.title)),
    [favorites],
  );
  const rail = useMemo(
    () =>
      favoriteChannels.length
        ? { title: 'Your favorites', data: favoriteChannels, isFavorites: true }
        : { title: 'Featured', data: featuredChannels, isFavorites: false },
    [favoriteChannels],
  );
  const railRef = useRef(rail);
  railRef.current = rail;

  const onScroll = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
  });

  const openFromGrid = useCallback(channel => {
    setPlayer({ channel, playlist: filteredRef.current });
  }, []);
  const openFromRail = useCallback(channel => {
    setPlayer({ channel, playlist: railRef.current.data });
  }, []);
  const selectInPlayer = useCallback(channel => {
    setPlayer(current => (current ? { ...current, channel } : current));
  }, []);
  const closePlayer = useCallback(() => setPlayer(null), []);

  const renderItem = useCallback(
    ({ item, index }) => (
      <ChannelCard
        item={item}
        index={index}
        animateEntry={index < 10}
        isFavorite={favorites.has(item.title)}
        onPress={openFromGrid}
        onToggleFavorite={toggleFavorite}
      />
    ),
    [favorites, openFromGrid, toggleFavorite],
  );

  const gridTitle = group === 'All' ? 'All channels' : group;

  return (
    <View style={styles.root}>
      <AuroraBackground scrollY={scrollY} paused={!!player} />

      <Animated.FlatList
        data={filtered}
        keyExtractor={item => item.key}
        renderItem={renderItem}
        numColumns={2}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
        columnWrapperStyle={styles.columns}
        contentContainerStyle={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom + space.xxl,
        }}
        ListHeaderComponent={
          <ListHeader
            scrollY={scrollY}
            search={search}
            onSearch={setSearch}
            group={group}
            onGroup={setGroup}
            rail={rail}
            onOpenFromRail={openFromRail}
            gridTitle={gridTitle}
            gridCount={filtered.length}
          />
        }
        ListEmptyComponent={<EmptyState query={deferredSearch} />}
      />

      <CompactHeader scrollY={scrollY} topInset={insets.top} channelCount={channels.length} />

      <PlayerModal
        channel={player?.channel ?? null}
        playlist={player?.playlist ?? []}
        onSelect={selectInPlayer}
        onClose={closePlayer}
        isFavorite={player ? favorites.has(player.channel.title) : false}
        onToggleFavorite={toggleFavorite}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  search: { paddingHorizontal: space.xl, marginBottom: space.md },
  columns: { paddingHorizontal: space.md },
});
