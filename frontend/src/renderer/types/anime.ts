
interface Platform {
  value: string;
  href: string;
  region: string;
}
const SEASON_TYPES = [1, 4, 7, 10] as const
export type Season = typeof SEASON_TYPES[number]

export type Anime = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  weekday: number; // 0-6 代表週日到週六
  platform: Platform[];
  cover: string;
  year: number;
  season: Season;
  episode: number;
  createdAt: number;
  updatedAt: number;  
  isFavorite?: boolean;
};