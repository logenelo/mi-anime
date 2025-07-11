import type { Anime, Season } from '../types/anime';
import { animesCrawler, getSeasonCode } from './animeHelper';

const isDev = false;
const url = isDev
  ? 'http://localhost:8787/anime'
  : 'https://api.genelo.org/anime';
//: 'https://cloudflare-worker.genelo5513.workers.dev/anime';

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

export const getAllAnimes = (params:any) => {
  return getMethod(`${url}`, params);
};
export const getAnimeById = (id: string) => {
  return getMethod(`${url}/get/${id}`);
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

export const getAnimesByYearAndSeason = (year: number, season: Season, focus?:boolean) => {
  return getMethod(`${url}/get/${year}/${season}`).then(async (resp) => {
    if (resp?.animes.length === 0 || focus ) {
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
  const [currentYear, currentSeason] = getSeasonCode(date);

  return getAnimesByYearAndSeason(currentYear, currentSeason);
};

export const fetchUrl = (targetUrl: string) => {
  return fetch(`${url}/fetch?url=${targetUrl}`).then((response) =>
    response.text(),
  );
};

export const deleteAnime = (id: string) => {
  return fetch(`${url}/${id}`, {
    method: 'DELETE',
  })
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error('Error fetching animes:', error);
    });
};

export const deleteAllAnimes = () => {
  return fetch(`${url}`, {
    method: 'DELETE',
  })
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error('Error fetching animes:', error);
    });
}
