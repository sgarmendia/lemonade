const http = require("http");
const url = require("url");

const main = require("./main");

const server = http.createServer(async (req, res) => {
	const parsedUrl = url.parse(req.url, true);

	if (parsedUrl.pathname === "/teasers" && req.method === "GET") {
		const data = await main();
		res.writeHead(200, { "Content-Type": "application/json" });
		res.end(JSON.stringify(data));
	} else {
		res.writeHead(404);
		res.end();
	}
});

server.listen(3000, () => {
	console.log("Server is listening on port 3000");
});
