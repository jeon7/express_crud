const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dirData = "./data";
const template = require('../lib/template.js');

// third party middle ware
const sanitizeHtml = require('sanitize-html');

router.get('/create', function (request, response) {
    const title = "WEB - create";
    const body = `
      <form action="/topic/create_process" method="POST">
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

router.post('/create_process', function (request, response) {
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
        response.redirect(301, `/topic/${filteredPostTitle}`);
    }
});

router.get('/update/:topicId', function (request, response) {
    const title = request.params.topicId;
    fs.readFile(`${dirData}/${title}`, "utf8", function (err, description) {
        const list = template.list(request.list);
        const body = `
          <form action="/topic/update_process" method="POST">
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

router.post('/update_process', function (request, response) {
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
        response.redirect(301, `/topic/${filteredPostTitleUpdated}`);
    }
});

router.post('/delete_process', function (request, response) {
    const post = request.body;
    const postTitle = post.title;
    const filteredPostTitle = path.parse(postTitle).base;
    fs.unlink(`${dirData}/${filteredPostTitle}`, function (err) {
    });
    response.redirect(301, `/`);
});


router.get('/:topicId', function (request, response, next) {
    const title = request.params.topicId;
    const filteredTitle = path.parse(title).base;

    fs.readFile(`${dirData}/${filteredTitle}`, "utf8", function (err, description) {
        if (err) {
            next(err);
        } else {
            const sanitizedTitle = sanitizeHtml(title);
            const sanitizedDescription = sanitizeHtml(description, {
                allowedTags: ['h1']
            });
            const list = template.list(request.list);
            const control = `
          <a href="/topic/create">create</a>
          <a href="/topic/update/${sanitizedTitle}">update</a>
          <form action="/topic/delete_process" method="POST"
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

module.exports = router;