const mongo_cde = require('../server/cde/mongo-cde');
const mongo_form = require('../server/form/mongo-form');


let done = 0;

let run = async function() {
    let cdeCursor = mongo_cde.getStream({tinyId: /-/});

    for (let cde = await cdeCursor.next(); cde != null; cde = await cdeCursor.next()) {
        cde.tinyId = cde.tinyId.replace(/-/g, "_");
        await cde.save();
        if (done++ % 50 === 0) {
            // await new Promise(r => setTimeout(r, 2000));
            console.log(done);
        }
    }

    console.log("fixed " + done + " cdes");

    done = 0;
    let formCursor = mongo_form.getStream({});
    for (let form = await formCursor.next(); form != null; form = await formCursor.next()) {
        function replaceIds(fe) {
            if (fe.formElements) {
                fe.formElements.forEach(fee => {
                    if (fee.elementType === 'question') {
                        fee.question.cde.tinyId.replace(/-/g, "_");
                    }
                    else replaceIds(fee);
                });
            }
        }
        replaceIds(form);
        await form.save();
        if (done++ % 50 === 0) {
            await new Promise(r => setTimeout(r, 1000));
            console.log(done);
        }
    }

    console.log("fixed " + done + " forms");
    process.exit(0);

};

run();
