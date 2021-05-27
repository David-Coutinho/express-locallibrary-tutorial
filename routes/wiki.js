// wiki.js - Wiki route module

let express = require('express');
let router = express.Router();

// Home page route
router.get('/', function (request, response) {
  response.send('Wiki home page');
});

// About page route
router.get('/about', function (request, response) {
  response.send('About this wiki');
});

module.exports = router;
