const http = require("http");
const url = require("node:url");
const fs = require("node:fs");

const fetchData = require("./fetchData");

const server = http.createServer(async (req, res) => {
	const { pathname } = url.parse(req.url, true);

	if (req.method !== "GET") {
		res.writeHead(404);
		return res.end();
	}

	const {
		titles,
		teasersNotInNewsletter,
		teasersNotOnlyForSchools,
		notOnlyForSchools,
	} = await fetchData();

	res.writeHead(200, { "Content-Type": "application/json" });

	switch (pathname) {
		case "/allresults":
			const allResultsStream = fs.createReadStream("allResults.txt");

			allResultsStream.on("error", function () {
				res.writeHead(500);
				res.end("Error reading file");
			});
			allResultsStream.pipe(res);
			break;
		case "/teasers":
			res.end(teasersNotInNewsletter);
			break;
		case "/titles":
			res.end(titles);
			break;
		case "/notonlyforschools":
			res.end(
				JSON.stringify(
					{
						notOnlyForSchools,
						teasersNotOnlyForSchools: JSON.parse(teasersNotOnlyForSchools),
					},
					null,
					2
				)
			);
			break;
		default:
			res.writeHead(400);
			res.end("Incorrect pathway");
			break;
	}
});

server.listen(3000, () => {
	console.log("Server is listening on port 3000");
});
