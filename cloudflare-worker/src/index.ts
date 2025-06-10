import { Router, Handler } from './router';
import {
	listAnimes,
	createAnimes,
	deleteAnime,
	listAnimesByIds,
	getAnimesByYearAndSeason,
	crawlSeasonAnimes,
	getAnimeById,
	deleteAnimes,
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
	.delete('/anime/:id', deleteAnime)
	.delete('/anime', deleteAnimes);



const getResponseBody = (req: Request, resp: Response) =>{
	if (req.url.includes('/anime/fetch')) {
		return resp.text();
	}else{
		return resp.json<Record<string, any>>();
	}
	
} 
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		try {
			if (request.method !=='GET') {
				return await router.handle(request, env, ctx);
			}
			
			// Cache the response
			const cacheKey = new Request(request.url, request); // Create a cache key based on the request
			const cache = caches.default; // Use the default cache

			// Check if the response is in the cache
			let response = await cache.match(cacheKey);
			if (response) {
				const body:any = await getResponseBody(request, response);
				const responseBody = typeof body === 'string' ? body : JSON.stringify(body);

				console.log('Cache hit!');
				if (body?.lastUpdateTime) {
					const newUpdateTime = Number(await env.ANIME.get('lastUpdateTime')) || 0;
					const lastUpdateTime = body.lastUpdateTime;
					console.log(`New: ${newUpdateTime} Last: ${lastUpdateTime}`) 
					if (newUpdateTime<=lastUpdateTime) {
						return new Response(responseBody,response);
					}
				} else {
					return new Response(responseBody,response);
				}
			}
			//not in cache
			response = await router.handle(request, env, ctx);
			const body = await getResponseBody(request, response);
			const responseBody = typeof body === 'string' ? body : JSON.stringify(body);

			if (!request.url.includes('/anime/fetch') && response.ok ) {
				const responseToCache = new Response(JSON.stringify(body), response);
				// Cache the response for 1 day
				responseToCache.headers.append('Cache-Control', 'max-age=86400');
				await cache.put(cacheKey, responseToCache);
			}
			return new Response(responseBody, response);	
		} catch (err: any) {
			console.error(`Error: ${err}`);
			return new Response(err.message, { status: 500 });
		}
	},
	//  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
	// 	console.log("cron processed");
	// },
} satisfies ExportedHandler<Env>;
