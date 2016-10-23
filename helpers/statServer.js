/**
 * This file manages HTTP requests that give statistics about server and db
 */

const https = require('https');
const dbmanager = require('./dbmanager');
const fs = require('fs');
const config = require('../config');

const opts = {
  key: fs.readFileSync(config.ssl_key_path),
  cert: fs.readFileSync(config.ssh_rsa_path),
};

https.createServer(opts, (req, res) => {
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
}).listen(3000, () => {
  console.log('Statistics server listening on: 3000');
});
