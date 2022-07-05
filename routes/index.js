const bodyParser = require('body-parser');
var express = require('express');
var router = express.Router();
var httpProxy = require('http-proxy')
var apiProxy = httpProxy.createProxyServer()

folderExample = [
  {name: "item1", type: "fldr"},
  {name: "item2", type: "fldr"},
  {name: "item3", type: "item"},
  {name: "item4", type: "item"},
  {name: "item5", type: "item"}
]

workspaceNameExample = 'ITLingo'

/* GET home page. */
router.get('/', function(req, res, next) {
  
  res.render('index', { title: 'Workspace - ' + workspaceNameExample ,
                      filesList: folderExample,
                      workspaceName: workspaceNameExample});
});

const LANGUAGE_SERVER = 'http://localhost:3010/'

apiProxy.on('error', function (error, req, res) {
  console.error('Proxy error:', error)
  if (!res.headersSent) {
    res.writeHead(500, { 'content-type': 'application/json' })
  }

  var json = { error: 'proxy_error', reason: error.message }
  res.end(JSON.stringify(json))
})

router.all('/xtext-service/*', bodyParser.json, function (req, res) {
apiProxy.web(req, res, { target: LANGUAGE_SERVER });
});


module.exports = router;
