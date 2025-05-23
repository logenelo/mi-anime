import { Router } from './router';
import {
  getAnime,
  listAnimes,
  createAnimes,
  updateAnime,
  deleteAnime,
  listAnimesByIds,
  getAnimesByYearAndSeason,
  crawlSeasonAnimes
} from './handlers/anime';

export interface Env {
  ANIME: KVNamespace;
}

const router = new Router();

router
  .get('/anime/:id', getAnime)
  .get('/anime', listAnimes)
  .get('/anime/ids', listAnimesByIds)
  .get('/anime/:year/:season', getAnimesByYearAndSeason)
  .post('/anime/crawl', crawlSeasonAnimes)
  .post('/anime', createAnimes)
  .put('/anime/:id', updateAnime)
  .delete('/anime/:id', deleteAnime);

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      return await router.handle(request, env, ctx);
    } catch (err: any) {
      console.error(`Error: ${err}`);
      return new Response(err.message, { status: 500 });
    }
  },
} satisfies ExportedHandler<Env>;