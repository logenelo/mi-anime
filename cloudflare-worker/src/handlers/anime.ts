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

interface AnimeMetadata {
	year: number;
	season: number;
}
export const animesCrawler = async (year: number, season: number) => {
	const seasonMap: Record<number, string> = {
		1: '01', // Winter
		4: '04', // Spring
		7: '07', // Summer
		10: '10', // Fall
	};

	try {
		const seasonCode = seasonMap?.[season];
		if (!seasonCode) {
			throw new Error('Invalid season');
		}

		const url = `https://acgsecrets.hk/bangumi/${year}${seasonCode}`;
		console.log('Crawling URL:', url);
		const html = await fetch(url, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
			},
		}).then((res) => res.text());
		return html;
	} catch (error) {
		console.error('Crawler error:', error);
		return [];
	}
};

export async function listAnimes(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	const list = await env.ANIME.list({prefix: 'anime-'});
	
	const animes: AnimeData[] = await Promise.all(
		list.keys.map(async (key) => {
			const string = await env.ANIME.get(key.name);
			return string && JSON.parse(string)
		})
	).then((animes) => animes.filter((anime)=>anime));

	const lastUpdateTime = Number(await env.ANIME.get('lastUpdateTime')) || 0;
	const response = {
		statusCode: 200,
		lastUpdateTime,
		animes,
	};
	return new Response(JSON.stringify(response), {
		headers: {
			'Content-Type': 'application/json',
		},
	});
}

export async function getAnimeById(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	const { id } = request.params;
	const anime = await env.ANIME.get(id);
	const lastUpdateTime = Number(await env.ANIME.get('lastUpdateTime')) || 0;

	if (!anime) {
		return new Response('Anime not found', {
			status: 404,
		});
	}

	const response = {
		statusCode: 200,
		lastUpdateTime,
		anime: JSON.parse(anime),
	};
	return new Response(JSON.stringify(response), {
		headers: {
			'Content-Type': 'application/json',
		},
	});
}

export async function listAnimesByIds(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	const {
		ids,
	}: {
		ids: string[];
	} = await request.json();

	if (!Array.isArray(ids)) {
		return new Response(
			JSON.stringify({
				statusCode: 500,
				message: 'Invalid body format',
			}),
			{
				status: 200,
			}
		);
	}

	const animeStrings = await Promise.all(ids.map((id) => env.ANIME.get(id)));

	const animes: AnimeData[] = animeStrings
		.filter((anime): anime is string => anime !== null)
		.map((anime) => JSON.parse(anime))
		.reverse();
	const lastUpdateTime = Number(await env.ANIME.get('lastUpdateTime')) || 0;

	const response = {
		statusCode: 200,
		lastUpdateTime,
		animes: animes,
	};
	return new Response(JSON.stringify(response), {
		headers: {
			'Content-Type': 'application/json',
		},
	});
}

export async function getAnimesByYearAndSeason(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	const { year, season } = request.params;
	if (!year || !season || !Number(year) || !Number(season)) {
		return new Response('Invalid body format', {
			status: 400,
		});
	}

	const list = await env.ANIME.list<AnimeMetadata>({prefix: 'anime-'});
	const filteredList  = list.keys.filter((key) => key.metadata && key.metadata.year == Number(year) && key.metadata.season == Number(season));
	const animeStrings = await Promise.all(filteredList.map((key) => env.ANIME.get(key.name)));

	const animes: AnimeData[] = animeStrings.filter((anime): anime is string => anime !== null).map((anime) => JSON.parse(anime));

	const lastUpdateTime = Number(await env.ANIME.get('lastUpdateTime')) || 0;

	const response = {
		statusCode: 200,
		lastUpdateTime,
		animes: animes,
	};
	return new Response(JSON.stringify(response), {
		headers: {
			'Content-Type': 'application/json',
		},
	});
}

export async function crawlSeasonAnimes(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	const {
		year,
		season,
	}: {
		year: number;
		season: number;
	} = await request.json();

	const html = await animesCrawler(year, season);

	return new Response(JSON.stringify(html), {
		headers: {
			'Content-Type': 'application/json',
		},
	});
}

export async function createAnimes(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	const req = await request.json<any>();
	const newAnimes = req.animes;
	if (!Array.isArray(newAnimes)) {
		return new Response('Invalid body format', {
			status: 400,
		});
	}

	const results = await Promise.all(
		newAnimes.map(async (anime) => {
			// Check if anime already exists
			if (anime.id) {
				const existing = await env.ANIME.get(anime.id);
				if (existing) {
					// Update existing record
					const updatedAnime = {
						...JSON.parse(existing),
						...anime,
						updatedAt: new Date().getTime(),
					};
					await env.ANIME.put('anime-'+anime.id, JSON.stringify(updatedAnime),{metadata: {year: updatedAnime.year, season: updatedAnime.season}});	
					return {
						...updatedAnime,
						updated: true,
					};
				}
			}

			// Create new record
			const newAnime = {
				...anime,
				id: anime.id || crypto.randomUUID(),
				createdAt: new Date().getTime(),
				updatedAt: new Date().getTime(),
			};
			await env.ANIME.put('anime-'+newAnime.id, JSON.stringify(newAnime),{metadata: {year: newAnime.year, season: newAnime.season}});
			return {
				...newAnime,
				created: true,
			};
		})
	);
	await env.ANIME.put('lastUpdateTime', new Date().getTime().toString());
	const response = {
		statusCode: 200,
		animes: results,
	};

	return new Response(JSON.stringify(response), {
		status: 201,
		headers: {
			'Content-Type': 'application/json',
		},
	});
}

export async function deleteAnime(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	const id = new URL(request.url).pathname.split('/')[2];
	if (id === 'clear') {
		const list = await env.ANIME.list();
		const animes = await Promise.all(list.keys.map((key) => env.ANIME.get(key.name)));
		animes.forEach((anime) => {
			if (anime) {
				const parsedAnime = JSON.parse(anime);

				if (!parsedAnime?.title) {
					console.log(parsedAnime);
					return env.ANIME.delete(parsedAnime.id);
				} // Delete filtered animes
			}
		});

		return new Response(null, {
			status: 204,
		});
	}

	const existing = await env.ANIME.get(id);

	if (!existing) {
		return new Response('Anime not found', {
			status: 404,
		});
	}

	await env.ANIME.delete(id);
	return new Response(null, {
		status: 204,
	});
}

export async function deleteAnimes(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	const list = await env.ANIME.list();
	const deleteAll = await Promise.all(list.keys.map((key) => env.ANIME.delete(key.name)));

	return new Response(
		JSON.stringify({
			message: 'Deleted ' + deleteAll.length + ' animes',
		}),
		{
			status: 204,
		}
	);
}
