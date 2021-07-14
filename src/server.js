'use strict';

const express = require('express');
const pug = require('pug');

// Constants
const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

// App
const app = express();

const ws_urls = process.env.WS_URLS.split(',');

app.get('/', async (req, res) => {
  res.send(pug.renderFile('index.pug', {
    ws_urls: ws_urls
  }));
});

app.use(express.static('public'));

app.listen(PORT, HOST);

console.log(`HTTP server running on http://${HOST}:${PORT}`);
