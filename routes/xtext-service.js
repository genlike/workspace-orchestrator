var httpProxy = require('http-proxy');

var apiProxy = httpProxy.createProxyServer({
  secure: false,
  changeOrigin: true
});
var express = require('express');
var service = express.Router();
const bodyParser = require('body-parser');

const LANGUAGE_SERVER = 'http://localhost:3010/'

apiProxy.on('error', function (error, req, res) {
  console.error('Proxy error:', error)
  if (!res.headersSent) {
    res.writeHead(500, { 'content-type': 'application/json' });
  }

  var json = { error: 'proxy_error', reason: error.message };
  res.end(JSON.stringify(json));
});
service.use(bodyParser.json());
service.all('/*', function (req, res) {
    apiProxy.web(req, res, { target: LANGUAGE_SERVER });
});


module.exports = service;