export interface Platform {
  value: string;
  href: string;
  region: string;
}
const SEASON_TYPES = [1, 4, 7, 10] as const;
export type Season = (typeof SEASON_TYPES)[number];
export const SEASONS = [
  { value: 1, label: '冬季' }, // 1-3月
  { value: 4, label: '春季' }, // 4-6月
  { value: 7, label: '夏季' }, // 7-9月
  { value: 10, label: '秋季' }, // 10-12月
];

export const WEEKDAY_NAMES = [
  '日',
  '一',
  '二',
  '三',
  '四',
  '五',
  '六',
] as const;
export type WeekdayNames = typeof WEEKDAY_NAMES[number];

export const weekdayColors = [
  '#FF0000', // Red
  '#FFA500', // Orange
  '#FFEA00', // Yellow
  '#008000', // Green
  '#0000FF', // Blue
  '#4B0082', // Indigo
  '#EE82EE', // Violet
];

export type Anime = {
  id: string;
  title: string;
  description: string;
  startDate: number;
  weekday: number; // 0-6 代表週日到週六
  platform: Platform[];
  cover: string;
  episode: number;
  year: number;
  season: Season;

  createdAt?: number;
  updatedAt?: number;
  isFavorite?: boolean;
  isContin?: boolean;
  hasNew?:boolean;
};
