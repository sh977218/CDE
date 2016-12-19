var mongo_form = require('../../modules/form/node-js/mongo-form'),
    Form = mongo_form.Form
    ;

let cdeCount = 0;

var stream = Form.find({
    archived: null,
    'stewardOrg.name': 'NINDS',
    "registrationState.registrationStatus": {$not: /Retired/}
}).stream();
stream.on('error', function (e) {
    console.log(e);
    process.exit(1);
});
stream.on('close', function () {
    console.log('cdeCount: ' + cdeCount);
    process.exit(1);
});
stream.on('data', function (cde) {
    stream.pause();
    cde.sources = [{sourceName: 'NINDS'}];
    cde.naming.forEach(function (n) {
        n.source = 'NINDS';
    });
    cde.properties.forEach(function (p) {
        p.source = 'NINDS';
    });
    cde.referenceDocuments.forEach(function (r) {
        r.source = 'NINDS';
    });
    cde.save(function (e) {
        if (e) process.exit(1);
        else {
            cdeCount++;
            console.log('cdeCount: ' + cdeCount);
            stream.resume();
        }
    })
});
