/* eslint-disable import/prefer-default-export */
import * as cheerio from 'cheerio';
import { Anime, Season } from '../types/anime';
import { crawlAnimes } from './api';

import html from './test';

export const WEEKDAY_NAMES = [
  '日',
  '一',
  '二',
  '三',
  '四',
  '五',
  '六',
] as const;

export const getWeekdayLabel = (day: number) => {
  return WEEKDAY_NAMES[day];
};

export const animesCrawler = async (year: number, season: Season) => {
  try {
    // const html = await crawlAnimes(year, season);
    const $ = cheerio.load(html);
    const animes: any[] = [];

    const cards = $('#acgs-anime-list').find('.card-like');
    cards.each((_, element) => {
      const card = $(element);

      // Extract title
      const title = card.find('.entity_localized_name').first().text().trim();

      if (!title) return;
      console.log(title);
      const description = card.find('.anime_story').text().trim();

      // Extract air time and weekday
      const timeText = card.find('.time_today').text().trim();
      const dateMatch = timeText.match(
        /(\d{4})年(\d{1,2})月(\d{1,2})日起／每週(.)／(\d{1,2})時(\d{1,2})分/,
      );

      let weekday = 0;
      let startDate = '';

      if (dateMatch) {
        const weekdayMap: Record<string, number> = {
          日: 0,
          一: 1,
          二: 2,
          三: 3,
          四: 4,
          五: 5,
          六: 6,
        };
        weekday = weekdayMap[dateMatch[4]] || 0;

        // Format start date
        const month = dateMatch[2].padStart(2, '0');
        const day = dateMatch[3].padStart(2, '0');
        startDate = `${dateMatch[1]}-${month}-${day}`;
      }

      // Extract cover image
      const cover = card.find('.anime_cover_image img').attr('src') || '';

      // Extract platforms from stream sites
      const platforms = card
        .find('.steam-site-item')
        .map((i, item) => {
          const siteElement = $(item).find('.stream-site');
          return {
            value: $(item).find('.steam-site-name').text().trim(),
            href: siteElement.attr('href') || '',
            region: siteElement.attr('site-area') || '',
          };
        })
        .get()
        .filter((p) => p.value); // Filter out empty platform names

      // Default episode count (most seasonal anime are 12-13 episodes)
      const episode = 12;

      animes.push({
        id: `${year}-${season}-${title}`,
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
  } catch (error) {
    console.error('Crawler error:', error);
    return [];
  }
};
