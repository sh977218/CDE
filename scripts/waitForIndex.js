const request = require('request');


setInterval(() => {
    console.log("Waiting for indexing to be complete");
    request.get("http://localhost:3001/status/cde", (err, res, body) => {
       if (body.indexOf("ERROR") === -1 && body.indexOf("false") === -1 && body.indexOf("indices") > 0) {
            console.log("indexing complete");
           process.exit(0);
       }
    });
}, 3000);