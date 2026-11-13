/**
 * @format
 */

import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import { categories, filterChannels, channels } from '../src/data/channels';

jest.useFakeTimers();

test('renders the home screen with channels', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });

  const strings = renderer!.root
    .findAllByType(Text)
    .map(node => [node.props.children].flat().join(''));
  expect(strings).toContain('Live TV');
  expect(strings).toContain('Test Music');

  await ReactTestRenderer.act(() => {
    renderer!.unmount();
  });
});

test('builds categories from the channel data', () => {
  expect(categories).toEqual(['All', 'Music', 'News']);
});

test('filters by search text and category', () => {
  expect(filterChannels(channels, 'news', 'All').map(c => c.title)).toEqual(['Test News']);
  expect(filterChannels(channels, '', 'Music').map(c => c.title)).toEqual(['Test Music']);
  expect(filterChannels(channels, '  ', 'All')).toHaveLength(2);
});
