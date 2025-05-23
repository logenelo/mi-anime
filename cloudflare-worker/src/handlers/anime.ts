import type { Env } from '../index';


interface AnimeData {
  id: string;
  title: string;
  weekday: string;
  startDate: string;
  platform: string;
  cover: string;
  year: number;
  season: number;
  episode: number;
}

export const animesCrawler = async (year:number, season:number) => {
 const seasonMap: Record<number, string> = {
    1: '01', // Winter
    4: '04', // Spring
    7: '07', // Summer
    10: '10' // Fall
  };

  try {
    const seasonCode = seasonMap?.[season];
    if (!seasonCode){
      throw new Error('Invalid season');
    }

    const url = `https://acgsecrets.hk/bangumi/${year}${seasonCode}`;
    console.log('Crawling URL:', url);
    const html = await fetch(url,{
      headers:{
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    }).then(res => res.text());
    return html
  } catch (error) {
    console.error('Crawler error:', error);
    return [];
  }
}


export async function getAnime(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const id = new URL(request.url).pathname.split('/')[2];
  const anime = await env.ANIME.get(id);
  
  if (!anime) {
    return new Response('Anime not found', { status: 404 });
  }
  
  return new Response(anime, {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function listAnimes(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const list = await env.ANIME.list();
  const animes = await Promise.all(
    list.keys.map(key => env.ANIME.get(key.name))
  );
  
  const response = {
    statusCode:200,
    animes
  }
  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function listAnimesByIds(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  //const { ids } = await request.json()
  const ids:[] = [];
  console.log(request)
  if (!Array.isArray(ids)) {
    return new Response('Invalid body format', { status: 400 });
  }

  const animes = await Promise.all(
    ids.map(id => env.ANIME.get(id))
  );

  const response = {
    statusCode:200,
    animes: animes
  }
  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function getAnimesByYearAndSeason(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  //console.log(request)
  const { year, season } = request.params; 
  
  const list = await env.ANIME.list();
  const animeStrings = await Promise.all(
    list.keys.map(key => env.ANIME.get(key.name))
  );

  const animes: AnimeData[] = animeStrings
    .filter((anime): anime is string => anime !== null)
    .map(anime => JSON.parse(anime));

  const filteredAnimes = animes.filter((anime: AnimeData) => anime.year === year && anime.season === season);

  const response = {
    statusCode:200,
    animes: filteredAnimes
  }
  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function crawlSeasonAnimes(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const {year, season}: { year: number, season: number } = await request.json(); 
  console.log(request.json());
  const html = await animesCrawler(year, season);
  const response = {
    statusCode:200,
    body: html
  }
  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function createAnimes(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const req = await request.json<any>();
  const newAnimes = req.animes;
  if (!Array.isArray(newAnimes)) {
    return new Response('Invalid body format', { status: 400 });
  }

  const results = await Promise.all(newAnimes.map(async (newAnime) => {
    if (!newAnime.id) {
      newAnime.id = crypto.randomUUID();
    }
    
    await env.ANIME.put(newAnime.id, JSON.stringify({
      ...newAnime,
      createdAt: new Date().getTime(), 
      updatedAt: new Date().getTime()
    }));
    return newAnime;
  }));

  const response = {
    statusCode:200,
    animes: results
  }

  return new Response(JSON.stringify(response), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function updateAnime(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const id = new URL(request.url).pathname.split('/')[2];
  const existing = await env.ANIME.get(id);
  
  if (!existing) {
    return new Response('Anime not found', { status: 404 });
  }
  
  const updatedAnime: AnimeData = await request.json();
  await env.ANIME.put(id, JSON.stringify(updatedAnime));
  
  return new Response(JSON.stringify(updatedAnime), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function deleteAnime(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const id = new URL(request.url).pathname.split('/')[2];
  const existing = await env.ANIME.get(id);
  
  if (!existing) {
    return new Response('Anime not found', { status: 404 });
  }
  
  await env.ANIME.delete(id);
  return new Response(null, { status: 204 });
}