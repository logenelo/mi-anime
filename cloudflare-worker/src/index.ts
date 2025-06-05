import { Router, Handler } from './router';
import {
	listAnimes,
	createAnimes,
	updateAnime,
	deleteAnime,
	listAnimesByIds,
	getAnimesByYearAndSeason,
	crawlSeasonAnimes,
	getAnimeById,
} from './handlers/anime';
import test from './handlers/htmlParser';
import {fetchUrl} from  './handlers/handlers'

export interface Env {
	ANIME: KVNamespace;
}

const router = new Router();

router
	.get('/anime', listAnimes)
	.get('/anime/fetch', fetchUrl)
	.get('/anime/get/:year/:season', getAnimesByYearAndSeason)
	.get('/anime/get/:id', getAnimeById)
	.get('/test', test)
	.post('/anime', createAnimes)
	.post('/anime/crawl', crawlSeasonAnimes)
	.post('/anime/ids', listAnimesByIds)
	.put('/anime/:id', updateAnime)
	.delete('/anime/:id', deleteAnime);

//.delete('/anime', deleteAnimes);


export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		try {
			return await router.handle(request, env, ctx);
		} catch (err: any) {
			console.error(`Error: ${err}`);
			return new Response(err.message, { status: 500 });
		}
	},
	 async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
		
    console.log("cron processed");
  },
} satisfies ExportedHandler<Env>;
