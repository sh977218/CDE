import { dataElementModel } from 'server/cde/mongo-cde';
const spellChecker = require('simple-spellchecker');
const yesno = require('yesno');
const fs = require('fs');

const steward = process.argv.slice(2)[0];
if (!steward) {
    console.error('Missing steward');
    process.exit(1);
}
let dictionary;
spellChecker.getDictionary('en-US', (err, dic) => {
    if (!err) {
        dictionary = dic;
    }
});

process.on('unhandledRejection', (error) => {
    console.log(error);
});

const filename = './spellcheck.whitelist';
let whitelist;
async function addToList(term) {
    if (whitelist.indexOf(term === -1)) {
        whitelist.push(term);
        const toWrite = whitelist.join(';');
        await fs.writeFileSync(filename, toWrite, 'utf8');
    }
}

async function run() {
    const cond = {'stewardOrg.name': steward,
        'registrationState.registrationStatus': {$ne: 'Retired'},
            archived: false};
    let cdeCount = await dataElementModel.countDocuments(cond);
    console.log(`TODO: ${cdeCount}`);
    whitelist = await fs.readFileSync(filename, 'utf8').split(';');
    const cursor = dataElementModel.find(cond).cursor();
    cursor.eachAsync(async (dataElementSource: any) => {
        const cdeObj = dataElementSource.toObject();
        cdeCount--;

        for (const designation of cdeObj.designations) {
            const terms = designation.designation.replace(/([ '":.,;()\-?/\[\]]+)/g, '§sep§')
                .split('§sep§');
            for (let term of terms) {
                if (term.toUpperCase() !== term) {
                    term = term.trim().toLowerCase();
                    if (whitelist.indexOf(term) === -1) {
                        const misspelled = !dictionary.spellCheck(term);
                        if (misspelled) {
                            console.log(`${term} in tinyId: ${cdeObj.tinyId}`);
                            const ok = await yesno({
                                question: 'Add to whitelist?'
                            });
                            if (ok) {
                                await addToList(term);
                            }
                        }
                    }
                }
            }
        }

        console.log(`cde sources TODO: ${cdeCount}`);
    }).then(() => {
        console.log('finished.');
        process.exit(0);
    }, e => {
        console.log(e);
        process.exit(1);
    });
}

run();
