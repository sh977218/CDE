var mongo_form = require('../modules/form/node-js/mongo-form');

var stream = mongo_form.getStream({
    "formElements.formElements.question.datatypeNumber.maxValue": 0,
    archived: false,
    "stewardOrg.name": "NINDS"
});

var done = 0;
stream.on('data', function (form) {
    stream.pause();

    form.formElements[0].formElements.forEach(function (fe) {
        try {
            if (fe.question.datatypeNumber.maxValue === 0) {
                 delete fe.get("question").datatypeNumber.maxValue;
            }
        } catch (e) {
            //ignore
        }
    });
    form.markModified("formElements");
    form.save(function (err) {
        if (err) {
            console.log("ERROR: " + err);
            process.exit(1)
        }
        console.log(done++);
        stream.resume();
    })

});

