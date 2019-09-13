module.exports = {
    html: function (title, list, body, control) {
      return `
    <!doctype html>
    <html>
    <head>
      <title>WEB2 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">WEB</a></h1>
      ${list}
      ${control}
      ${body}
    </body>
    </html>
    `;
    },
    list: function (fileList) {
      var list = `<ul>`;
      for (var i = 0; i < fileList.length; i++) {
        list += `<li><a href="/?id=${fileList[i]}">${fileList[i]}</a></li>`;
      }
      list += `</ul>`;
      return list;
    }
  };

   