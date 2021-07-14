'use strict';

const express = require('express');
const child_process = require('child_process');
const ws = require('ws');
const pug = require('pug');

// Constants
const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

// App
const app = express();

const rtsp_urls = process.env.RTSP_URLS.split(',');

var wss_port = 65535;
var wss_ports = [];

function openRtspStream(wss, rtsp_url) {
  var ffmpeg_path = "ffmpeg";
  var spawn_options = [
    "-re",
    "-rtsp_transport",
    "tcp",
    "-i",
    rtsp_url,
    "-f",
    "mpegts",
    "-codec:v",
    "mpeg1video",
    "-r",
    "30",
    "-"
  ];

  var ffmpeg = child_process.spawn(ffmpeg_path, spawn_options, {
    detached: false
  });

  console.log("spawining: " + ffmpeg_path + " " + spawn_options.join(" "));

  ffmpeg.on('spawn', () => {
    console.log(`${rtsp_url}: spawn`);
  });

  ffmpeg.on('error', (err) => {
    console.log(`${rtsp_url}: ${err}`);
  });

  ffmpeg.on('disconnect', () => {
    console.log(`${rtsp_url}: disconnected`);
  });

  ffmpeg.on('message', (message) => {
    console.log(`${rtsp_url}: ${message}`);
  });

  ffmpeg.stdout.on('data', (data) => {
    wss.clients.forEach(function each(client) {
      if (client.readyState === ws.OPEN) {
        client.send(data);
      }
    });
  });

  ffmpeg.stderr.on('data', (data) => {
    console.error(data.toString());
  });

  ffmpeg.on('exit', (code) => {
    console.log(`disconnected from ${rtsp_url}, waiting to retry`);
    setTimeout(() => {
      console.log(`reconnecting to ${rtsp_url}`);
      openRtspStream(wss, rtsp_url);
    }, 10000);
  });
}

rtsp_urls.forEach((rtsp_url) => {

  var wss = new ws.Server({
    port: wss_port
  });

  openRtspStream(wss, rtsp_url);

  console.log(`${rtsp_url} => ws://${HOST}:${wss_port}`);
  wss_ports.push(wss_port);
  wss_port = wss_port - 1;
});

app.get('/', async (req, res) => {
  res.send(pug.renderFile('index.pug', {
    wss_ports: wss_ports
  }));
});

app.use(express.static('public'));

app.listen(PORT, HOST);

console.log(`HTTP server running on http://${HOST}:${PORT}`);
