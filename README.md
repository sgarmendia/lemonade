# lemonade test

This code demonstrates a simple HTTP server running on Node.js (version 18) with zero dependencies.

The server can be run from a docker container as follows:

```javascript
docker build -t server .

docker run -p 3000:3000 server

```

or by running:

```javascript
node index.js

```

## Server Setup

Initially the server checks to make sure that the request method is `GET`, otherwise it responds with a 404 status code.

Depending on the endpoint that the client requested, it fetches data with the `fetchData` function and sends different responses:

- If the client requests **/allresults**, the server reads the content of 'allResults.txt' and sends it in the response. These are all the results from the TEASERS of the last 6 months.

- If the client requests **/teasers**, the server responds with 'teasersNotInNewsletter'.
  Point 1 of the questions in the test.

- If the client requests **/titles**, 'titles' and 'issue dates' are returned. Point 2 of the questions in the test.

- If the client requests **/notonlyforschools**, 'notOnlyForSchools' number and 'teasersNotOnlyForSchools' teasers are returned as the result. Point 3 of the question in the test.

For unmatched routes, the server responds with a 400 status code and ends the response.

## Cache

To avoid excesive burden on the api and provide some throtling a cache is implemented with a TTL of 20000 ms.

## Deployment

The server is deployed to an _Elastic Beanstalk_ instance in AWS using a pipeline with _github actions_

The deployed server can be tested here:

http://lemonade-env.eba-k7djjqd2.us-east-1.elasticbeanstalk.com/

just add the desired route at the end:

- **/allresults**

- **/teasers**

- **/titles**

- **/notonlyforschools**

---

Made with love in Barcelona by _Simon Garmendia_
