const express = require('express');
const app = express();
const fs = require('fs');

const port = 3000;
const dirData = "./data";
const topicRouter = require('./routes/topic.js');
const indexRouter = require('./routes/index.js');

// third party middle ware
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

app.use('/topic', topicRouter);
app.use('/', indexRouter);

app.use(function (request, response, next) {
    response.status(404).send("The page cannot be found");
});

app.use(function (err, request, response, next) {
    console.error(err.stack);
    response.status(500).send("The topic doesn't exist");
});

app.listen(port, function () {
    console.log(`Example app listening on port ${port}!`);
}); 