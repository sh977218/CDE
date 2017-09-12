const request = require('request');


let indexInt = setInterval(() => {
    console.log("Waiting for indexing to be complete");
    request.get("http://localhost:3001/status/cde", (err, res, body) => {
       if (body.indexOf("ERROR") === -1 && body.indexOf("false") === -1 &&
           body.indexOf('indices":[]') === -1 && body.indexOf('indices') > 0) {
            console.log("indexing complete, status returned: ");
            console.log(body);
            clearInterval(indexInt);
            request.post("http://localhost:3001/syncWithMesh", {}, () => {
                setInterval(() => {
                    request.get("http://localhost:3001/syncWithMesh", (err, res, body) => {
                        body = JSON.parse(body);
                        console.log(body);
                       if (body.dataelement.done === body.dataelement.total &&
                           body.form.done === body.form.total
                       ) {
                           console.log("Done indexing");
                           process.exit(0);
                       } else {
                           console.log("Waiting for Mesh Sync");
                       }
                    });
                }, 3000);
            })
       }
    });
}, 3000);