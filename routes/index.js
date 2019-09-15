const express = require('express');
const router = express.Router();

const template = require('../lib/template.js');

router.get('/', function (request, response) {
    const title = "Welcome";
    const description = "Hello Node.js";
    const list = template.list(request.list);
    const body = `
      <h2>${title}</h2>
      ${description}
      <img src="/images/hello.jpg" style="width:300px; display:block; margin-top:10px;">
      <p>Photo by Pablo Gentile on Unsplash</p>
      `;
    const control = `
      <a href="/topic/create">create</a>
      `;
    const html = template.html(title, list, body, control);
    response.send(html);
});

module.exports = router;