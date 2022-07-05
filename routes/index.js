var express = require('express');
var router = express.Router();

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

module.exports = router;
