const mongo_cde = require("../server/cde/mongo-cde");
const mongo_form = require("../server/form/mongo-form");
const mongo_system = require("../server/system/mongo-data");

const Files = mongo_system.mongoose_connection.model('fs.files',
    { filename: String, metadata: {status: String} } );

async function run() {

    let total = await Files.find({"metadata.status": "uploaded"}).count();
    let scanned = 0;
    let attachmentsApproved = 0;

    Files.find({"metadata.status": "uploaded"}).cursor({batchSize: 20}, {}).eachAsync(async oneFile => {
        let elts = await mongo_cde.DataElement.find({"attachments.fileid": oneFile._id.toString()}).exec();

        if (elts.length) {

            if (elts[0].updatedBy.username === 'batchloader' ||
                (!elts[0].updatedBy.username && elts[0].createdBy.username === 'batchloader')) {
                attachmentsApproved++;

                Files.update({_id: oneFile._id}, {"metadata.status": "approved"}, (err, nb) => {
                    if (err) {
                        console.log(err);
                        process.exit(1);
                    }
                });
            }
        }

        console.log(`Total: ${total} --- Attachment approved ${attachmentsApproved} --- Scanned: ${++scanned}`);
    });



}

run();