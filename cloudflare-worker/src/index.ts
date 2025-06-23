import {
	Router,
	Handler
} from './router';
import {
	listAnimes,
	createAnimes,
	deleteAnime,
	listAnimesByIds,
	getAnimesByYearAndSeason,
	crawlSeasonAnimes,
	getAnimeById,
	deleteAnimes,
	addAnimes,
	getCrawlAnimes,
} from './handlers/anime';
import { fetchUrl, test } from './handlers/handlers';

export interface Env {
	ANIME: KVNamespace;
}

const router = new Router();
router
	.get('/anime', listAnimes)
	.get('/anime/fetch', fetchUrl)
	.get('/anime/get/:year/:season', getAnimesByYearAndSeason)
	.get('/anime/get/:id', getAnimeById)
	.post('/anime', createAnimes)
	.post('/anime/crawl', crawlSeasonAnimes)
	.post('/anime/ids', listAnimesByIds)
	.delete('/anime/:id', deleteAnime)
	.delete('/anime', deleteAnimes);



const getResponseBody = (req: Request, resp: Response) => {
	if (req.url.includes('/anime/fetch')) {
		return resp.text();
	} else {
		return resp.json<Record<string, any>>();
	}
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		try {
			if (request.method !== 'GET') {
				return await router.handle(request, env, ctx);
			}

			// Cache the response
			const cacheKey = new Request(request.url, request); // Create a cache key based on the request
			const cache = caches.default; // Use the default cache

			// Check if the response is in the cache
			let response = await cache.match(cacheKey);
			if (response) {
				const body: any = await getResponseBody(request, response);
				const responseBody = typeof body === 'string' ? body : JSON.stringify(body);

				console.log('Cache hit!');
				if (body?.lastUpdateTime) {
					const newUpdateTime = Number(await env.ANIME.get('lastUpdateTime')) || 0;
					const lastUpdateTime = body.lastUpdateTime;
					console.log(`New: ${newUpdateTime} Last: ${lastUpdateTime}`)
					if (newUpdateTime <= lastUpdateTime) {
						return new Response(responseBody, response);
					}
				} else {
					return new Response(responseBody, response);
				}
			}
			//not in cache
			response = await router.handle(request, env, ctx);
			const body = await getResponseBody(request, response);
			const responseBody = typeof body === 'string' ? body : JSON.stringify(body);

			if (!request.url.includes('/anime/fetch') && response.ok) {
				const responseToCache = new Response(JSON.stringify(body), response);
				// Cache the response for 1 day
				responseToCache.headers.append('Cache-Control', 'max-age=86400');
				await cache.put(cacheKey, responseToCache);
			}
			return new Response(responseBody, response);
		} catch (err: any) {
			console.error(`Error: ${err}`);
			return new Response(err.message, {
				status: 500
			});
		}
	},
	async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
		console.log("cron processed");
		const date = new Date();
		console.log(`Cron job executed at: ${date.toISOString()}`);
		const seasonMap = [1, 1, 1, 4, 4, 4, 7, 7, 7, 10, 10, 10];
		const year = date.getFullYear();
		const month = date.getMonth() + 1; // Months are zero-based in Java
		const season = seasonMap[month - 1]; // Get the season based on the month
		console.log(`Current year: ${year}, season: ${season}`);

		const animes = await getCrawlAnimes(year, season);
		const results = await addAnimes(animes, env);
		console.log('Crawled and added animes:', results.length);
		// If the month is March, June, September, or December, crawl the next season's animes
		if (month === 3 || month === 6 || month === 9 || month === 12) {
			const newYear = month === 12 ? year + 1 : year;
			const newSeason = month === 12 ? 1 : season + 3; //
			const animes = await getCrawlAnimes(newYear, newSeason);
			const results = await addAnimes(animes, env);
			console.log('Crawled and added next animes:', results);
		}
	},
} satisfies ExportedHandler <Env>;
