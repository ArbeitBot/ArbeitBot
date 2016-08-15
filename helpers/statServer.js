/**
 * This file manages HTTP requests that give statistics about server and db
 */

const http = require('http');
const dbmanager = require('./dbmanager');

http.createServer((req, res) => {
if (String(req.url) === `/getUserCount`) {
  dbmanager.userCount()
  	.then(c => {
  		res.writeHead(200);
  		res.end(`{ "count": ${c} }`);
  	})
  	.catch(err => {
  		res.writeHead(500);
  		res.end(err);
  	});
} else {
  res.writeHead(404);
  res.end('404');
}
}).listen(3000, () => {
	console.log('Statistics server listening on: 3000');
});