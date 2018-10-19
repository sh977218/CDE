const mongo_cde = require("../server/cde/mongo-cde");
const mongo_form = require("../server/form/mongo-form");
const mongo_system = require("../server/system/mongo-data");

const Files = mongo_system.mongoose_connection.model('fs.files',{ filename: String } );


async function run() {

    let total = await Files.find({}).count();
    let done = 0;
    let attachmentUsed = 0;
    let attachmentRemoved = 0;

    Files.find().cursor({batchSize: 20}).eachAsync(async oneFile => {
        let elts = await mongo_cde.DataElement.find({"attachments.fileid": oneFile._id.toString()}).exec();

        if (elts.length === 0) {
            elts =  await mongo_form.Form.find({"attachments.fileid": oneFile._id}).exec();
        }

        if (elts.length) attachmentUsed++;
        else {
            attachmentRemoved++;
            Files.remove({_id: oneFile._id}, err => {
                if (err) {
                    console.log(err);
                    process.exit(1);
                }
            })
        }

        console.log(`Total: ${total} --- Attachment used ${attachmentUsed} ---Removed: ${attachmentRemoved} --- Scanned: ${++done}`);
    });



}

run();