import type { Env } from '../index';
import { HtmlParser } from './parser';

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
		return '';
	}
};
export const getCrawlAnimes = async (year: number, season: number) => {
	const html = await animesCrawler(year, season);

	const parser = new HtmlParser(html);
	const icons = parser.getElementById('acgs-anime-icons')?.getElementsByClassName('acgs-card') || [];

	const animes = icons.map(async(icon) => {
		const id = icon.getAttribute('acgs-bangumi-data-id')
		const dateToday = icon.getAttribute('datetoday');

		const weekdayLabel = icon.getAttribute('weektoday') as string;
		const startDate = Number(icon.getAttribute('onairtime'));

		const card = parser.getElementById('acgs-anime-list')?.getElementsByAttribute("acgs-bangumi-anime-id", id)[0];
		if (!card) return;
		const title = card.getElementsByClassName('entity_localized_name')[0].text().trim();
		if (!title) return;

		const descriptionElement = card.getElementsByClassName('anime_story');
		const description = descriptionElement.length ? descriptionElement[0].text().trim() : '';
		const weekday = ['日','一','二','三','四','五','六'].indexOf(weekdayLabel) || 0;

		const cover = card.getElementsByClassName('anime_cover_image')[0].getElementsByTagName('img')[0]?.getAttribute('src') || '';
		const platforms = card.getElementsByClassName('steam-site-item')
			.map((item, i) => {
				const siteElement = item.getElementsByClassName('stream-site')[0];
				let href = siteElement.getAttribute('href') || '';
				const site = item.getElementsByClassName('steam-site-name')[0].text().trim();
				if (!href) {
					const sitesMap: Record < string, string > = {
						巴哈姆特動畫瘋: 'https://ani.gamer.com.tw/search.php?keyword=' + title,
						愛奇藝: `https://www.iq.com/search?query=${title}&originInput=`,
						Netflix: `https://www.netflix.com/search?q=${title}`,
					};
					href = sitesMap[site] || '';
				}
				return {
					value: site,
					href: href,
					region: siteElement.getAttribute('site-area') || '',
				};
			})
			.filter((p) => p.value); // Filter
		const linkElememt = card.getElementsByTagName('a').filter((item) => item.classList.includes('bgmtv'))[0];
		const link = linkElememt ? linkElememt.getAttribute('href') : '';
		const episode = link?
			await fetch(link).then((res) => res.text()).then((html) => {
				const parser = new HtmlParser(html);
				const info = parser.getElementById('infobox');
				const list =info?.getElementsByTagName('li');
				const result = list?.find((item) => item.text().includes('话数'));
				const episode = result ? parseInt(result.text().split(':')[1].trim()): NaN;
				if (isNaN(episode)) {
					const ul  = parser.getElementsByTagName('ul').find((item) => item.classList.includes('prg_list'));
					const li = ul?.getElementsByTagName('li');
					if (!li || li.length === 0) {
						return dateToday === '跨季續播' ? 24 : 12; // Default to 12 episodes for seasonal anime
					}
					if (li && li.length > 0) {
						const result = li[li.length - 1].text();
						const episode = parseInt(result);
						return episode ? episode : dateToday === '跨季續播' ? 24 : 12;
					}
				}else{
					return episode;
				}
			})
			: dateToday === '跨季續播' ? 24 : 12;

		const newAnime: any = {
			id: `${id?.split('-')[1]}`,
			title,
			description,
			weekday,
			startDate,
			platform: platforms,
			cover,
			year: dateToday == '跨季續播' ? undefined : year,
			season: dateToday == '跨季續播' ? undefined : season,
			episode,
		};
		return newAnime
	}).filter(anime => anime);
	return Promise.all(animes);
}


export async function listAnimes(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	const url = request.url;
  const params = new URL(url);

	const cursor = params.searchParams.get('cursor') || undefined;
	const limit = Number(params.searchParams.get('limit')) || 100;
	console.log(cursor, limit)

	const list = await env.ANIME.list<AnimeMetadata>({prefix: 'anime-', cursor, limit});
	console.log(list);
	
	const animes: AnimeData[] = await Promise.all(
		list.keys.map(async (key) => {
			const string = await env.ANIME.get(key.name);
			return string && JSON.parse(string)
		})
	).then((animes) => animes.filter((anime)=>anime));

	const lastUpdateTime = Number(await env.ANIME.get('lastUpdateTime')) || 0;
	const response: any = {
		statusCode: 200,
		lastUpdateTime,
		animes,
		finish:list.list_complete,
		cursor: (list as any)?.cursor
	};
	
	return new Response(JSON.stringify(response), {
		headers: {
			'Content-Type': 'application/json',
		},
	});
}

export async function getAnimeById(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	const { id } = request.params;
	const anime = await env.ANIME.get('anime-'+id);
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

	const animeStrings = await Promise.all(ids.map((id) => env.ANIME.get('anime-'+id)));

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

export const addAnimes = async (animes: AnimeData[], env: Env)=> {
		const results = await Promise.all(
		animes.map(async (anime) => {
			// Check if anime already exists
			if (anime.id) {
				const existing = await env.ANIME.get('anime-'+anime.id);
				if (existing) {
					// Update existing record
					const updatedAnime = {
						...JSON.parse(existing),
						...anime,
						updatedAt: new Date().getTime(),
					};
					await env.ANIME.put('anime-'+anime.id, JSON.stringify(updatedAnime),{metadata: {year: updatedAnime.year, season: updatedAnime.season, title: updatedAnime.title}});	
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
		return results;
}
export async function createAnimes(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	const req = await request.json<any>();
	const newAnimes = req.animes;
	if (!Array.isArray(newAnimes)) {
		return new Response('Invalid body format', {
			status: 400,
		});
	}

	const results = await addAnimes(newAnimes, env);
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

	const existing = await env.ANIME.get('anime-'+id);

	if (!existing) {
		return new Response('Anime not found', {
			status: 404,
		});
	}

	await env.ANIME.delete('anime-'+id);
	return new Response(null, {
		status: 204,
	});
}

export async function deleteAnimes(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	const list = await env.ANIME.list({prefix: 'anime-', limit: 900});
	const deleteAll = await Promise.all(list.keys.map((key) => env.ANIME.delete(key.name)));
	const lastUpdateTime = await env.ANIME.put('lastUpdateTime', '0');

	return new Response(
		null,
		{
			status: 204,
		}
	);
}
