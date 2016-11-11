/**
 * This file manages HTTP requests that give statistics about server and db
 *
 * @module helpers/statServer
 * @license MIT
 */

/** Dependencies */
const dbmanager = require('./dbmanager');
const http = require('http');

http.createServer((req, res) => {
  if (String(req.url) === '/getStats') {
    dbmanager.userCount()
      .then(c =>
        dbmanager.jobCount()
          .then(j =>
            dbmanager.freelancerCount()
              .then((f) => {
                res.writeHead(200, {
                  'Access-Control-Allow-Origin': '*',
                  'Access-Control-Allow-Headers': 'X-Requested-With',
                });
                res.end(`{ "userCount": ${c}, "jobCount": ${j}, "freelancerCount": ${f} }`);
              })
              .catch((err) => {
                res.writeHead(500);
                res.end(err);
              })
          )
          .catch((err) => {
            res.writeHead(500);
            res.end(err);
          })
      )
      .catch((err) => {
        res.writeHead(500);
        res.end(err);
      });
  } else {
    res.writeHead(404);
    res.end('404');
  }
}).listen(process.env.PORT || 5000, () => {
  console.log('Statistics server listening on: 5000'); // eslint-disable-line no-console
});
