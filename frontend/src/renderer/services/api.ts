import type { Anime, Season } from '../types/anime';
import { animesCrawler } from './animeHelper';

const isDev = false;
const url = isDev
  ? 'http://localhost:8787/anime'
  : 'http://api.genelo.org/anime';

const getMethod = (url: string, body?: any) => {
  const params = new URLSearchParams();
  if (body) {
    Object.keys(body).forEach((key) => {
      params.append(key, body[key]);
    });
  }
  if (params.toString() !== '') {
    url += `?${params.toString()}`;
  }

  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error('Error fetching animes:', error);
    });
};

const postMethod = (url: string, body?: any) => {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error('Error fetching animes:', error);
    });
};
const putMethod = (url: string, body?: any) => {
  return fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error('Error fetching animes:', error);
    });
};

export const getAllAnimes = () => {
  return getMethod(`${url}`);
};
export const getAnimeById = (id: string) => {
  return getMethod(`${url}/${id}`);
};
export const getAnimeByIds = (ids: string[]) => {
  return postMethod(`${url}/ids`, { ids });
};

export const addAnimes = (animes: Anime[]) => {
  return postMethod(`${url}`, { animes });
};
export const crawlAnimes = (year: number, season: Season) => {
  return postMethod(`${url}/crawl`, { year, season });
};

export const getAnimesByYearAndSeason = (year: number, season: Season) => {
  return getMethod(`${url}/${year}/${season}`).then(async (resp) => {
    if (resp?.animes.length === 0) {
      const animes = await animesCrawler(year, season);
    
      if (animes && animes.length > 0) {
        const result = await addAnimes(animes);
        return result;
      }

      return {
        statusCode: 404,
        message: 'No animes found for the given year and season',
      };
    }
    return resp;
  });
};

export const getSeasonAnimes = () => {
  const date = new Date();
  const currentYear = date.getFullYear();
  const currentSeason = (Math.floor((date.getMonth() + 1) / 3) * 3 +
    1) as Season;

  return getAnimesByYearAndSeason(currentYear, currentSeason);
};
