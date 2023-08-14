const https = require("https");

const fs = require("fs");
const { resolve } = require("path");

// Calculate the date 6 months ago
const sixMonthsAgo = new Date();
sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6 || 12); // Avoid edge case when month is january (0)
const sixMonthsAgoISOString = sixMonthsAgo.toISOString();

function fetchTeasers(callback) {
	const options = {
		hostname: "api.katholiekonderwijs.vlaanderen",
		path: `/content?type=TEASER&issuedAfter=${sixMonthsAgoISOString}&orderBy=issued`,
		method: "GET",
	};

	const req = https.request(options, (res) => {
		let data = "";

		res.on("data", (chunk) => {
			data += chunk;
		});

		res.on("end", () => {
			callback(null, JSON.parse(data).results);
		});
	});

	req.on("error", (error) => {
		callback(error);
	});

	req.end();
}

function main() {
	return new Promise((resolve) => {
		fetchTeasers((err, teasers) => {
			if (err) {
				console.error("Error fetching teasers:", err);
				return;
			}

			fs.writeFile("logs.txt", JSON.stringify(teasers, null, 2), (err) => {
				if (err) throw err;
				console.log("logs file created successfully.");
			});

			// Filter out teasers that are included in newsletters
			const teasersNotInNewsletter = teasers.filter((teaser) => {
				return !teaser.$$expanded.$$relationsFrom.some(
					(relation) => relation.$$expanded.relationtype === "IS_INCLUDED_IN"
				);
			});

			fs.writeFile(
				"teasersNotInNewsletter.txt",
				JSON.stringify(teasersNotInNewsletter, null, 2),
				(err) => {
					if (err) throw err;
					console.log("teasersNotInNewsletter file created successfully.");
				}
			);

			// Print title and issued date
			teasersNotInNewsletter.forEach((teaser) => {
				console.log(
					`Title: ${teaser.$$expanded.title}, Issued Date: ${teaser.$$expanded.issued}`
				);
			});

			// Count teasers not meant only for schools
			const teasersNotForSchools = teasersNotInNewsletter.filter((teaser) => {
				return !teaser.$$expanded.outypes?.includes("SCHOOL");
			});

			fs.writeFile(
				"teasersNotForSchools.txt",
				JSON.stringify(teasersNotForSchools, null, 2),
				(err) => {
					if (err) throw err;
					console.log("teasersNotForSchools file created successfully.");
				}
			);

			const message = `Number of teasers not only meant for schools: ${teasersNotForSchools.length}`;

			console.log(message);

			resolve({
				teasersNotInNewsletter,
				teasersNotForSchools,
				message,
			});
		});
	});
}

module.exports = main;
