import { Router, Handler } from './router';
import {
	listAnimes,
	createAnimes,
	deleteAnime,
	listAnimesByIds,
	getAnimesByYearAndSeason,
	crawlSeasonAnimes,
	getAnimeById,
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
	.get('/anime/test',test)
	.post('/anime', createAnimes)
	.post('/anime/crawl', crawlSeasonAnimes)
	.post('/anime/ids', listAnimesByIds)
	.delete('/anime/:id', deleteAnime);

//.delete('/anime', deleteAnimes);


export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		try {
			const cacheKey = new Request(request.url, request); // Create a cache key based on the request
			const cache = caches.default; // Use the default cache

			if (request.method === 'GET') {
				// Check if the response is in the cache
				let response = await cache.match(cacheKey);
				const body: any = await response?.json();
				console.log('Cache hit!');
				const newUpdateTime = Number(await env.ANIME.get('lastUpdateTime')) || 0;
				const lastUpdateTime = body?.lastUpdateTime
				if (newUpdateTime<=lastUpdateTime) {
					if (body) {
						return new Response(JSON.stringify(body));
					}
				}
			}


			let response = await router.handle(request, env, ctx);
			if (request.method === 'GET') {
				// Clone the response before caching (Response can only be used once)
				const responseClone = new Response(response.body, response);
				// Cache the response for 1 day
				responseClone.headers.append('Cache-Control', 'max-age=86400');
				await cache.put(cacheKey, responseClone);
			}
			return response
		} catch (err: any) {
			console.error(`Error: ${err}`);
			return new Response(err.message, { status: 500 });
		}
	},
	//  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
	// 	console.log("cron processed");
	// },
} satisfies ExportedHandler<Env>;
