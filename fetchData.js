const fs = require("node:fs/promises");

const cache = require("./cache");

const BASE_URL = "https://api.katholiekonderwijs.vlaanderen";

const sixMonthsAgoISOString = getISOdate();
const initialUrl = `${BASE_URL}/content?type=TEASER&orderBy=issued&issuedAfter=${sixMonthsAgoISOString}`;

async function fetchData() {
	const data = cache.get("data");
	if (data) return data;

	let allResults = [];
	let nextUrl = initialUrl;

	while (nextUrl) {
		try {
			const response = await fetch(nextUrl);
			const data = await response.json();

			if (data.results && data.results.length > 0) {
				allResults = allResults.concat(data.results);
			}

			// Check if there's a next URL to fetch from
			const next = data.$$meta && data.$$meta.next;

			nextUrl = next ? `${BASE_URL}${next}` : null;
		} catch (error) {
			console.error("Error fetching data:", error);
			break;
		}
	}

	try {
		await fs.unlink("allResults.txt");
	} catch (error) {
		if (error.code === "ENOENT") {
			console.error("allResults.tx file does not exist");
		}
	} finally {
		await fs.writeFile("allResults.txt", JSON.stringify(allResults));
	}

	const teasersNotInNewsletter = allResults
		.filter((teaser) => {
			return !teaser.$$expanded.$$relationsFrom.some(
				(relation) => relation.$$expanded.relationtype === "IS_INCLUDED_IN"
			);
		})
		.sort((a, b) => new Date(b.date) - new Date(a.date));

	const titles = teasersNotInNewsletter.map((teaser) => {
		return {
			title: teaser.$$expanded.title,
			date: teaser.$$expanded?.issued,
		};
	});

	const teasersNotOnlyForSchools = teasersNotInNewsletter.filter((teaser) => {
		const outypes = teaser.$$expanded?.outypes || [];
		return outypes.includes("SCHOOL") && outypes.length > 1;
	});

	const dataToChache = {
		titles: JSON.stringify(titles, null, 2),
		teasersNotInNewsletter: JSON.stringify(teasersNotInNewsletter, null, 2),
		teasersNotOnlyForSchools: JSON.stringify(teasersNotOnlyForSchools, null, 2),
		notOnlyForSchools: teasersNotOnlyForSchools.length.toString(),
	};

	cache.set("data", dataToChache, 20000);

	return dataToChache;
}

function getISOdate(months = 6) {
	const sixMonthsAgo = new Date();
	sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - months);
	return sixMonthsAgo.toISOString();
}

module.exports = fetchData;
