import html from './test.html';

class HTMLParser {
	private html: string;
	constructor(html: string) {
		this.html = html;
	}

	public async find(selector: string) {
		let elementSelector = selector;
		if (elementSelector.startsWith('.') || elementSelector.startsWith('#')) {
			elementSelector = '*' + selector;
		}

		let result: Element[] = [];

		const rewriter = new HTMLRewriter().on(elementSelector, {
			element(element) {
				result.push(element);
			},
			text(text) {},
		});
		await rewriter.transform(new Response(this.html)).text();
		if (result.length === 1) {
			return result[0];
		}
		return result;
	}
}

const crawlData = async (html: string) => {
	const result: any = [];

	const htmlResponse = new Response(html);
	const rewriter = new HTMLRewriter().on('.acgs-card', {
		element(card) {
			console.log(card, card.getAttribute('acgs-bangumi-data-id'));

			// const id = card.getAttribute('acgs-bangumi-data-id');
			// const dateToday = card.getAttribute('datetoday');
			// const weekdayLabel = card.getAttribute('weektoday');
			// const startDate = Number(card.getAttribute('onairtime'));

			// // Find corresponding anime card in the list
			// new HTMLRewriter().on(`*#acgs-anime-list [acgs-bangumi-anime-id="${id}"]`, {
			// 	element(animeCard) {
			// 		if (animeCard) {
			// 			const title = animeCard.querySelector('.entity_localized_name')?.innerText.trim();
			// 			if (!title) return;

			// 			const description = animeCard.querySelector('.anime_story')?.innerText.trim();
			// 			const weekday = WEEKDAY_NAMES.indexOf(weekdayLabel) || 0;
			// 			const cover = animeCard.querySelector('.anime_cover_image img')?.src || '';

			// 			// Extract platforms
			// 			const platforms = Array.from(animeCard.querySelectorAll('.steam-site-item'))
			// 				.map((item) => {
			// 					const siteElement = item.querySelector('.stream-site');
			// 					let href = siteElement?.href || '';
			// 					const site = item.querySelector('.steam-site-name')?.innerText.trim();

			// 					if (!href) {
			// 						const sitesMap: Record<string, string> = {
			// 							巴哈姆特動畫瘋: 'https://ani.gamer.com.tw/search.php?keyword=' + title,
			// 							愛奇藝: `https://www.iq.com/search?query=${title}&originInput=`,
			// 							Netflix: `https://www.netflix.com/search?q=${title}`,
			// 						};
			// 						href = sitesMap[site] || '';
			// 					}

			// 					return {
			// 						value: site,
			// 						href: href,
			// 						region: siteElement?.getAttribute('site-area') || '',
			// 					};
			// 				})
			// 				.filter((p) => p.value); // Filter out empty platform names

			// 			// Default episode count
			// 			const episode = dateToday === '跨季續播' ? 24 : 12;

			// 			// Push the anime data to the result array
			// 			result.push({
			// 				id: `${id?.split('-')[1]}`,
			// 				title,
			// 				description,
			// 				weekday,
			// 				startDate,
			// 				platform: platforms,
			// 				cover,
			// 				// Add year and season if available
			// 				year: null, // Adjust as needed
			// 				season: null, // Adjust as needed
			// 				episode,
			// 			});
			// 		}
			// 	},
			// });
		},
		comments(comment) {
			console.log(comment);
		},
		text(text) {
			console.log(text);
		},
	});

	await rewriter.transform(htmlResponse);
	console.log('Final result:', result);
	return result;
};

// Example usage in your worker:
async function test(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	const parser = new HTMLParser(html);
	const result = await crawlData(html);
	return new Response(JSON.stringify(result, null, 2), {
		headers: {
			'content-type': 'application/json',
			'access-control-allow-origin': '*',
		},
	});
}

export default test;
