const http = require("http");
const url = require("url");

const main = require("./main");

const server = http.createServer(async (req, res) => {
	const { pathname } = url.parse(req.url, true);

	if (req.method !== "GET") {
		res.writeHead(404);
		return res.end();
	}

	res.writeHead(200, { "Content-Type": "application/json" });

	switch (pathname) {
		case "/teasers":
			const teasers = await main();
			res.end(JSON.stringify(teasers));
			break;
		case "/descending":
			const descending = await main("descending");
			res.end(JSON.stringify(descending));
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
// https://8c19kdthxd.execute-api.us-east-1.amazonaws.com/med/95fab414-f63e-4df5-b539-6701098971c3
