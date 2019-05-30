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

                // too slow, dont wait. wait in test.
                request.post('http://localhost:3001/syncLinkedForms', {}, () => {
                });
                request.post('http://localhost:3001/server/mesh/syncWithMesh', {}, () => {
                    let meshInterval = setInterval(() => {
                        request.get('http://localhost:3001/server/mesh/syncWithMesh', (err, res, body) => {
                            body = JSON.parse(body);
                            console.log(body);
                            if (body && body.dataelement && body.form
                                && body.dataelement.done === body.dataelement.total
                                && body.form.done === body.form.total
                            ) {
                                console.log('Done indexing mesh');
                                clearInterval(meshInterval);
                                process.exit(0);
                            } else {
                                console.log('Waiting for Mesh Sync');
                            }
                        });
                    }, 3000);
                });
            }
        }
    });
}, 3000);
