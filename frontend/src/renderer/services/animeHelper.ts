/* eslint-disable import/prefer-default-export */
import * as cheerio from 'cheerio';
import { Anime, Season } from '../types/anime';
import { crawlAnimes } from './api';

export const WEEKDAY_NAMES = [
  '日',
  '一',
  '二',
  '三',
  '四',
  '五',
  '六',
] as const;
type WeekdayNames = (typeof WEEKDAY_NAMES)[number];

export const getWeekdayLabel = (day: number) => {
  return WEEKDAY_NAMES[day];
};

export const animesCrawler = async (year: number, season: Season) => {
  console.log('crawling animes', year, season);
  const html = await crawlAnimes(year, season);
  const $ = cheerio.load(html);
  const animes: Anime[] = [];

  const cards = $('#acgs-anime-icons').find('.acgs-card');
  cards.each((_, element) => {
    const icon = $(element);
    const id = icon.attr('acgs-bangumi-data-id');
    const dateToday = icon.attr('datetoday');

    const weekdayLabel = icon.attr('weektoday') as WeekdayNames;
    const startDate = Number(icon.attr('onairtime'));

    const card = $('#acgs-anime-list').find(`[acgs-bangumi-anime-id="${id}"]`);

    // Extract title
    const title = card.find('.entity_localized_name').first().text().trim();
    if (!title) return;
    const description = card.find('.anime_story').first().text().trim();

    const weekday = WEEKDAY_NAMES.indexOf(weekdayLabel) || 0;

    // Extract cover image
    const cover = card.find('.anime_cover_image img').attr('src') || '';

    // Extract platforms from stream sites
    const platforms = card
      .find('.steam-site-item')
      .map((i, item) => {
        const siteElement = $(item).find('.stream-site');
        let href = siteElement.attr('href') || '';
        const site = $(item).find('.steam-site-name').text().trim();
        if (!href) {
          const sitesMap: Record<string, string> = {
            巴哈姆特動畫瘋:
              'https://ani.gamer.com.tw/search.php?keyword=' + title,
            愛奇藝: `https://www.iq.com/search?query=${title}&originInput=`,
            Netflix: `https://www.netflix.com/search?q=${title}`,
          };
          href = sitesMap[site] || '';
        }
        return {
          value: site,
          href: href,
          region: siteElement.attr('site-area') || '',
        };
      })
      .get()
      .filter((p) => p.value); // Filter out empty platform names

    // Default episode count (most seasonal anime are 12-13 episodes)
    const episode = dateToday === '跨季續播' ? 24 : 12;

    animes.push({
      id: `${id?.split('-')[1]}`,
      title,
      description,
      weekday,
      startDate,
      platform: platforms,
      cover,
      year,
      season,
      episode,
    });
  });

  return animes;
};

export const getEpisodeCount = (anime: Anime) => {
  const date = new Date();

  // Calculate episode count divided by week
  const episodeCount =
    Math.floor((date.getTime() - Number(anime.startDate)) / 604800000) + 1;
  return Math.min(episodeCount, anime.episode);
};
