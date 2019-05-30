const request = require('request');

let doneMesh = false;
let doneLinkedForms = false;

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

                // too slow, wait a little bit. wait in test.
                request.post('http://localhost:3001/syncLinkedForms', {}, err => {
                    if (err) {
                        console.log('syncLinkedForms err: ' + err);
                        process.exit(1);
                    } else {
                        let linkedFormInterval = setInterval(() => {
                            request.get('http://localhost:3001/syncLinkedForms', (err, res, body) => {
                                body = JSON.parse(body);
                                console.log(body);
                                if (body.form.total > 0 && body.done === body.form.total) {
                                    console.log('Half way indexing linkedForms');
                                    clearInterval(linkedFormInterval);
                                    doneLinkedForms = true;
                                } else {
                                    console.log('Waiting for half way linkedForms Sync');
                                }
                            });
                        }, 3000);
                    }
                });
                request.post('http://localhost:3001/server/mesh/syncWithMesh', {}, err => {
                    if (err) {
                        console.log('syncWithMesh err: ' + err);
                        process.exit(1);
                    } else {
                        let meshInterval = setInterval(() => {
                            request.get('http://localhost:3001/server/mesh/syncWithMesh', (err, res, body) => {
                                body = JSON.parse(body);
                                console.log(body);
                                if (body.dataelement.done === body.dataelement.total
                                    && body.form.done === body.form.total) {
                                    console.log('Done indexing mesh');
                                    clearInterval(meshInterval);
                                    doneMesh = true;
                                } else {
                                    console.log('Waiting for Mesh Sync');
                                }
                            });
                        }, 3000);
                    }

                });
            }
        }
    });
}, 3000);

setInterval(() => {
    if (doneMesh && doneLinkedForms) process.exit(1);
}, 20000);
