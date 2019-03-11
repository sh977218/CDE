const request = require('request');

let indexInt = setInterval(() => {
    console.log('Waiting for indexing to be complete');
    request.get('http://localhost:3001/status/cde', (err, res, body) => {
        if (err) {
            console.log('Error on indexing: ' + err);
        } else {
            console.log(body);
            if (!!body && body.indexOf('ERROR') === -1 && body.indexOf('false') === -1 &&
                body.indexOf('indices":[]') === -1 && body.indexOf('indices') > 0) {
                console.log('indexing complete, status returned: ');
                clearInterval(indexInt);
                Promise.all([
                   new Promise(resolve => {
                        request.post('http://localhost:3001/server/mesh/syncWithMesh', {}, () => {
                            setInterval(() => {
                                request.get('http://localhost:3001/server/mesh/syncWithMesh', (err, res, body) => {
                                    body = JSON.parse(body);
                                    console.log(body);
                                    if (body.dataelement.done === body.dataelement.total &&
                                        body.form.done === body.form.total
                                    ) {
                                        console.log('Done indexing');
                                        resolve();
                                    } else {
                                        console.log('Waiting for Mesh Sync');
                                    }
                                });
                            }, 3000);
                        });
                   }),
                   new Promise(resolve => {
                       request.post('http://localhost:3001/syncLinkedForms', {}, () => {
                           setInterval(() => {
                               request.get('http://localhost:3001/syncLinkedForms', (err, res, body) => {
                                   body = JSON.parse(body);
                                   console.log(body);
                                   if (body.done === body.total) {
                                       console.log('Done indexing');
                                       resolve();
                                   } else {
                                       console.log('Waiting for Linked Form sync');
                                   }
                               });
                           }, 3000);
                       });

                   })
                ], done => process.exit(0));
            }
        }
    });
}, 3000);
