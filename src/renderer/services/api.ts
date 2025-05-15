import type { Anime } from '../types/anime';

const animeList: Anime[] = [
  {
    id: 1,
    title: '進擊的巨人',
    startDate: '2025-04-01',
    weekday: 0, // 週日
    platform: 'Crunchyroll',
    cover: 'https://via.placeholder.com/100x140?text=AoT',
  },
  {
    id: 2,
    title: '我的英雄學院',
    startDate: '2025-04-05',
    weekday: 0,
    platform: 'Funimation',
    cover: 'https://via.placeholder.com/100x140?text=MHA',
  },
  {
    id: 3,
    title: '咒術迴戰',
    startDate: '2025-04-04',
    weekday: 0,
    platform: 'Netflix',
    cover: 'https://via.placeholder.com/100x140?text=JJK',
  },
  {
    id: 4,
    title: '間諜家家酒',
    startDate: '2025-04-06',
    weekday: 0,
    platform: 'Crunchyroll',
    cover: 'https://via.placeholder.com/100x140?text=SPY',
  },
  {
    id: 5,
    title: '藍色監獄',
    startDate: '2025-04-02',
    weekday: 1,
    platform: 'Netflix',
    cover: 'https://via.placeholder.com/100x140?text=BP',
  },
  {
    id: 6,
    title: '葬送的芙莉蓮',
    startDate: '2025-04-03',
    weekday: 1,
    platform: 'Crunchyroll',
    cover: 'https://via.placeholder.com/100x140?text=SOF',
  },
];

export const getAllAnime = (): Anime[] => {
  return animeList;
};

export const getAnimeByIds = (ids: number[]): Anime[] => {
  return animeList.filter((anime) => ids.includes(anime.id));
};
