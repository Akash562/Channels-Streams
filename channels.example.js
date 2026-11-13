/**
 * Sample channel list.
 *
 * The app imports `channels` from `./channels.js`, which is git-ignored so
 * real stream URLs stay out of the repository. To set up a fresh clone:
 *
 *   cp channels.example.js channels.js
 *
 * then replace the entries below with your own channels.
 *
 * Fields
 *   id     unique number
 *   title  channel name (also used as the favorites key, so keep it unique)
 *   group  category shown in the filter chips: Music, News, Movies, Religious
 *   logo   https URL of the channel logo (looks best on a white background)
 *   url    HLS stream URL (.m3u8). Plain http:// streams also need their
 *          domain allowed in android/app/src/main/res/xml/network_security_config.xml
 *          and in ios/TvChannel/Info.plist (NSExceptionDomains).
 */
export const channels = [
  {
    id: 1,
    title: 'Sample Channel',
    group: 'Music',
    logo: 'https://www.logourl.com/hello.png',
    url: 'https://example.com/stream/playlist.m3u8',
  },
];
