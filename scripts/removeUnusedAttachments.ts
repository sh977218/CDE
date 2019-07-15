import { DataElement } from "../server/cde/mongo-cde";
import { Form } from "../server/form/mongo-form";
import { mongoose_connection } from "../server/system/mongo-data";

const Files = mongoose_connection.model('fs.files',{ filename: String } );

async function run() {
    let total = await Files.countDocuments({});
    let done = 0;
    let attachmentUsed = 0;
    let attachmentRemoved = 0;

    Files.find().cursor({batchSize: 20}).eachAsync(async oneFile => {
        let elts = await DataElement.find({"attachments.fileid": oneFile._id.toString()}).exec();
        if (elts.length === 0) {
            elts =  await Form.find({"attachments.fileid": oneFile._id}).exec();
        }
        if (elts.length) {
            attachmentUsed++;
        } else {
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

run().then(()=>{}, err => console.log(err));
