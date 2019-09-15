const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

const port = 3000;
const dirData = "./data";
const template = require('./lib/template.js');

// third party middle ware
const sanitizeHtml = require('sanitize-html');
const bodyParser = require('body-parser');
const compression = require('compression');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.get('/*', function (request, response, next) {
  fs.readdir(dirData, function (error, fileList) {
    request.list = fileList;
    console.log(request.list);
    next();
  });
});

app.get('/', function (request, response) {
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
      <a href="/create">create</a>
      `;
  const html = template.html(title, list, body, control);
  response.send(html);
});

app.get('/page/:pageId', function (request, response, next) {
  const title = request.params.pageId;
  const filteredTitle = path.parse(title).base;

  fs.readFile(`${dirData}/${filteredTitle}`, "utf8", function (err, description) {
    if(err) {
      next(err);
    } else {
      const sanitizedTitle = sanitizeHtml(title);
      const sanitizedDescription = sanitizeHtml(description, {
        allowedTags: ['h1']
      });
      const list = template.list(request.list);
      const control = `
        <a href="/create">create</a>
        <a href="/update/${sanitizedTitle}">update</a>
        <form action="/delete_process" method="POST"
        onSubmit='return confirm("are you sure that you want to delete?")'>
          <input type="hidden" name="title" value="${sanitizedTitle}">
          <input type="submit" value="delete">
        </form>
        `;
      const body = `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`;
      const html = template.html(sanitizedTitle, list, body, control);
      response.send(html);
    }
  
  });
});

app.get('/create', function (request, response) {
  const title = "WEB - create";
  const body = `
    <form action="/create_process" method="POST">
    <p><input type="text" name="title" placeholder="title"></p>
    <p><textarea name="description" cols="50" rows="20" placeholder="description"></textarea></p>
    <p><input type="submit"></p>
    </form>
    `;
  const list = template.list(request.list);
  const control = ``;
  const html = template.html(title, list, body, control);
  response.send(html);
});

app.post('/create_process', function (request, response) {
  const post = request.body;
  const postTitle = post.title;
  const postDescription = post.description;

  //  user input is empty
  if (!postTitle || !postDescription) {
    response.send("fill the information");
  } else {
    var filteredPostTitle = path.parse(postTitle).base;
    fs.writeFile(`${dirData}/${filteredPostTitle}`, postDescription, 'utf8', function (err) {
    });
    response.redirect(301, `/page/${filteredPostTitle}`);
  }
});

app.get('/update/:pageId', function (request, response) {
  const title = request.params.pageId;
  fs.readFile(`${dirData}/${title}`, "utf8", function (err, description) {
    const list = template.list(request.list);
    const body = `
        <form action="/update_process" method="POST">
        <p><input type="hidden" name="title_origin" value="${title}")</p>
        <p><input type="text" name="title_updated" value="${title}"></p>
        <p><textarea name="description" cols="50" rows="20">${description}</textarea></p>
        <p><input type="submit"></p>
        </form>
        `;
    const control = ``;
    const html = template.html(title, list, body, control);
    response.send(html);
  });
});

app.post('/update_process', function (request, response) {
  const post = request.body;
  const postTitleOrigin = post.title_origin;
  const postTitleUpdated = post.title_updated;
  const postDescription = post.description;

  //  user input is empty
  if (!postTitleUpdated || !postDescription) {
    response.send("fill the information");
  } else {
    const filteredPostTitleUpdated = path.parse(postTitleUpdated).base;
    fs.rename(`${dirData}/${postTitleOrigin}`, `${dirData}/${filteredPostTitleUpdated}`, function (err) {
    });
    fs.writeFile(`${dirData}/${filteredPostTitleUpdated}`, postDescription, 'utf8', function (err) {
    });
    response.redirect(301, `/page/${filteredPostTitleUpdated}`);
  }
});

app.post('/delete_process', function (request, response) {
  const post = request.body;
  const postTitle = post.title;
  const filteredPostTitle = path.parse(postTitle).base;
  fs.unlink(`${dirData}/${filteredPostTitle}`, function (err) {
  });
  response.redirect(301, `/`);
});

app.use(function(request, response, next) {
  response.status(404).send("The page cannot be found");
});

app.use(function(err, request, response, next) {
  console.error(err.stack);
  response.status(500).send("The page doesn't exist");
});

app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
}); 