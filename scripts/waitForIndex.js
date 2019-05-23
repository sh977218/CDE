const request = require('request');
const async = require('async');

async.parallel([
    function (cb) {
        request.post('http://localhost:3001/syncLinkedForms', {}, err => {
            if (err) {
                console.log('Post Sync Linked Forms Error: ' + err);
                process.exit(1);
            } else cb();
        });
    },
    function (cb) {
        request.post('http://localhost:3001/server/mesh/syncWithMesh', {}, err => {
            if (err) {
                console.log('Post Sync With Mesh Error: ' + err);
                process.exit(1);
            } else cb();
        });
    },
    function (cb) {
        let meshInterval = setInterval(() => {
            console.log('Waiting for mesh indexing to be complete');
            request({
                uri: 'http://localhost:3001/server/mesh/syncWithMesh',
                method: 'GET',
                json: true
            }, (err, res, body) => {
                if (err) {
                    console.log('Get Sync With Mesh Error: ' + err);
                    process.exit(1);
                } else if (body.dataelement.done === body.dataelement.total
                    && body.form.done === body.form.total) {
                    console.log('Done indexing mesh');
                    clearInterval(meshInterval);
                    cb();
                } else {
                    console.log('Waiting for Mesh Sync.');
                }
            });
        }, 3000);
    },
    function (cb) {
        let indexInt = setInterval(() => {
            console.log('Waiting for elastic indexing to be complete');
            request({
                uri: 'http://localhost:3001/status/cde',
                method: 'GET',
            }, (err, res, body) => {
                if (err) {
                    console.log('Get status cde Error: ' + err);
                } else if (!!body && body.indexOf('ERROR') === -1
                    && body.indexOf('false') === -1
                    && body.indexOf('indices":[]') === -1
                    && body.indexOf('indices') > 0) {
                    console.log('indexing complete, status returned: ');
                    clearInterval(indexInt);
                    cb();
                } else {
                    console.log('Waiting for status cde.');
                }

            });

        }, 3000);

    }
], err => {
    if (err) {
        console.log('Wait For Index Error: ' + err);
        process.exit(1);
    } else process.exit(0);
});


