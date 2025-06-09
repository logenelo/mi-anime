import type { Env } from '../index';

export const fetchUrl =  async (request: Request, env: Env, ctx: ExecutionContext) => {
  const url = request.url;
  const params = new URL(url);
  const targetUrl = params.searchParams.get('url');
  if (!targetUrl) {
    return new Response('Invalid url', { status: 400 });
  }

  const response = await fetch(targetUrl).then(response => response.text());
  return new Response((response), {
    headers: { 'Content-Type': 'application/json' }
  });;
};

export const test = async (request: Request, env: Env, ctx: ExecutionContext) => {
  // Group animes
	const list = await env.ANIME.list({limit: 500});
  console.log(list.keys);
  const animeobj = await env.ANIME.get('animeList');
  const animes = JSON.parse(animeobj || '{}');
  delete animes.animeList
	await Promise.all(
		list.keys.map(async (key) => {
			if (key.name !== 'lastUpdateTime' && key.name !== 'animeList') {
				const string = await env.ANIME.get(key.name);
        console.log(string)
				if (string) {
					animes[key.name] = JSON.parse(string);
				}
			}
		})
	);
  
  
  await env.ANIME.put('animeList', JSON.stringify(animes));

  //Del animes
  Object.keys(animes).forEach(async (key) => {
    console.log(key)
    await env.ANIME.delete(key);
  })

  return new Response(JSON.stringify(animes, null, 2), { status: 200 });
};