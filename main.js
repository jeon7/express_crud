var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var path = require('path');
var template = require('./lib/template.js');
var dirData = "./data";
var sanitizeHtml = require('sanitize-html');

var app = http.createServer(function (request, response) {
  var queryString = request.url;
  var queryData = url.parse(queryString, true).query;
  var pathName = url.parse(queryString, true).pathname;

  if (pathName === "/") {
    showWebpage(queryData.id, response);
  } else if (pathName === "/create") {
    create(response);
  } else if (pathName === "/create_process") {
    createProcess(request, response);
  } else if (pathName === "/update") {
    update(queryData.id, response);
  } else if (pathName === "/update_process") {
    updateProcess(request, response);
  } else if (pathName === "/delete_process") {
    deleteProcess(request, response);
  } else {
    response.writeHead(404);
    response.end("Not Found");
  }
});

app.listen(3000);

function showWebpage(queryData_id, response) {
  var title;
  var description;
  var body;
  var list;
  var control;
  var html;

  if (queryData_id === undefined) {
    fs.readdir(dirData, function (error, fileList) {
      title = "Welcome";
      description = "Hello Node.js";
      list = template.list(fileList);
      control = `
        <a href="/create">create</a>
        `;
      body = `<h2>${title}</h2>${description}`;

      html = template.html(title, list, body, control);
      response.writeHead(200);
      response.end(html);
    });
  }
  else {
    title = queryData_id;
    var filteredTitle = path.parse(title).base;
    fs.readFile(`${dirData}/${filteredTitle}`, "utf8", function (err, description) {
      fs.readdir(dirData, function (error, fileList) {
        var sanitizedTitle = sanitizeHtml(title);
        var sanitizedDescription = sanitizeHtml(description, {
          allowedTags: ['h1']
        });

        list = template.list(fileList);
        control = `
        <a href="/create">create</a>
        <a href="/update?id=${sanitizedTitle}">update</a>
        
        <form action="delete_process" method="POST" 
        onSubmit='return confirm("are you sure that you want to delete?")'>
          <input type="hidden" name="title" value="${sanitizedTitle}">
          <input type="submit" value="delete">
        </form>
        `;
        body = `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`;
        html = template.html(sanitizedTitle, list, body, control);
        response.writeHead(200);
        response.end(html);
      });
    });
  }
}

function create(response) {
  var title;
  var body;
  var list;
  var control;
  var html;

  fs.readdir(dirData, function (error, fileList) {
    
    title = "WEB - create";
    body = `
    <form action="create_process" method="POST">
    <p><input type="text" name="title" placeholder="title"></p>
    <p><textarea name="description" cols="50" rows="20" placeholder="description"></textarea></p>
    <p><input type="submit"></p>
    </form>
    `;
    list = template.list(fileList);
    control = ``;
    
    html = template.html(title, list, body, control);
    response.writeHead(200);
    response.end(html);
  });
}

function createProcess(request, response) {
  var body = ``;
  var post;
  var postTitle;
  var postDescription;

  request.on('data', function (data) {
    body += data;
  });

  request.on('end', function () {
    post = qs.parse(body);
    postTitle = post.title;
    postDescription = post.description;

    //  user input is empty
    if (!postTitle || !postDescription) {
      response.writeHead(200);
      response.end("fill the information");
    } else {
      var filteredPostTitle = path.parse(postTitle).base;
      fs.writeFile(`${dirData}/${filteredPostTitle}`, postDescription, 'utf8', function (err) {
      });
      response.writeHead(301, { Location: `/?id=${filteredPostTitle}` });
      response.end();
    }
  });
}

function update(queryData_id, response) {
  var title = queryData_id;
  var body;
  var list;
  var control;
  var html;
  fs.readFile(`${dirData}/${title}`, "utf8", function (err, description) {
    fs.readdir(dirData, function (error, fileList) {
      list = template.list(fileList);
      body = `
        <form action="update_process" method="POST">
        <p><input type="hidden" name="title_origin" value="${title}")</p>
        <p><input type="text" name="title_updated" value="${title}"></p>
        <p><textarea name="description" cols="50" rows="20">${description}</textarea></p>
        <p><input type="submit"></p>
        </form>
        `;
      control = ``;
      html = template.html(title, list, body, control);
      response.writeHead(200);
      response.end(html);
    });
  });
}

function updateProcess(request, response) {
  var body = ``;
  var post;
  var postTitleOrigin;
  var postTitleUpdated;
  var postDescription;

  request.on('data', function (data) {
    body += data;
  });

  request.on('end', function () {
    post = qs.parse(body);
    postTitleOrigin = post.title_origin;
    postTitleUpdated = post.title_updated;
    postDescription = post.description;

    //  user input is empty
    if (!postTitleUpdated || !postDescription) {
      response.writeHead(200);
      response.end("fill the information");
    } else {
      var filteredPostTitleUpdated = path.parse(postTitleUpdated).base;
      fs.rename(`${dirData}/${postTitleOrigin}`, `${dirData}/${filteredPostTitleUpdated}`, function (err) {

      });
      fs.writeFile(`${dirData}/${filteredPostTitleUpdated}`, postDescription, 'utf8', function (err) {

      });

      response.writeHead(301, { Location: `/?id=${filteredPostTitleUpdated}` });
      response.end();
    }
  });
}

function deleteProcess(request, response) {
  var body = ``;
  var post;
  var postTitle;

  request.on('data', function (data) {
    body += data;
  });

  request.on('end', function () {
    post = qs.parse(body);
    postTitle = post.title;
    var filteredPostTitle = path.parse(postTitle).base;
    fs.unlink(`${dirData}/${filteredPostTitle}`, function (err) {

    });

    response.writeHead(301, { Location: `/` });
    response.end();
  });
}