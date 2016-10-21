var mongo_form = require('../modules/form/node-js/mongo-form'),
    mongo_cde = require('../modules/cde/node-js/mongo-cde'),
    mongo_data = require('../modules/system/node-js/mongo-data')
    ;

var stream = mongo_cde.getStream({});

stream.on('data', function (elt) {
    elt.comments.forEach(function (c) {
        c.element = {
            eltType: "cde",
            eltId: elt.tinyId
        };
        new mongo_data.Comments(c).save(function (err) {
            if (err) {
                console.log(err);
                process.exit(1);
            }
        });
    });
});

var formStream = mongo_form.getStream({});
stream.on('data', function (elt) {
    elt.comments.forEach(function (c) {
        c.element = {
            eltType: "form",
            eltId: elt.tinyId
        };
        new mongo_data.Comments(c).save(function (err) {
            if (err) {
                console.log(err);
                process.exit(1);
            }
        });
    });
});

