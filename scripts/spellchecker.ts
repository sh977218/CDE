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

const whitelistFile = './scripts/spellcheck.whitelist';
const blacklistFile = './scripts/spellcheck.blacklist';
let whitelist = [];
let blacklist = [];
async function addToList(term) {
    if (whitelist.indexOf(term === -1)) {
        whitelist.push(term);
        await fs.writeFileSync(whitelistFile, whitelist, 'utf8');
    }
}

const errors = [];
async function markAsError(term, tinyId) {
    errors.push({tinyId, term});
    await fs.writeFileSync('./scripts/spellcheck.output', JSON.stringify(errors), 'utf8');
    if (blacklist.indexOf(term === -1)) {
        blacklist.push(term);
        await fs.writeFileSync(blacklistFile, blacklist, 'utf8');
    }

}

async function run() {
    try {
        whitelist = await fs.readFileSync(whitelistFile, 'utf8').split(',');
        blacklist = await fs.readFileSync(blacklistFile, 'utf8').split(',');
    } catch (e) {}
    const cond = {'stewardOrg.name': steward,
        'registrationState.registrationStatus': {$ne: 'Retired'},
            archived: false};
    let cdeCount = await dataElementModel.countDocuments(cond);
    console.log(`TODO: ${cdeCount}`);
    const cursor = dataElementModel.find(cond).cursor();
    cursor.eachAsync(async (cde: any) => {
        cdeCount--;

        for (const designation of cde.designations) {
            const terms = designation.designation.replace(/([ '|="!…:_.,;()–\-?/\[\]]+)/g, '§sep§').split('§sep§');
            for (let term of terms) {
                if (term.toUpperCase() !== term) {
                    term = term.trim().toLowerCase();
                    if (whitelist.indexOf(term) === -1) {
                        const misspelled = !dictionary.spellCheck(term);
                        if (misspelled) {
                            console.log(`${term} in tinyId: ${cde.tinyId}`);
                            let ok = false;
                            if (blacklist.indexOf(term) !== -1) {
                            } else {
                                ok = await yesno({
                                    question: 'Add to whitelist?'
                                });
                            }
                            if (ok) {
                                await addToList(term);
                            } else {
                                await markAsError(term, cde.tinyId);
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
