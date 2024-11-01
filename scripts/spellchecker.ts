import { readFileSync, writeFileSync } from 'fs';
import { dataElementModel, getStream } from 'server/mongo/mongoose/dataElement.mongoose';
import { DataElement } from 'shared/de/dataElement.model';
import { CdeId } from 'shared/models.model';
const spellChecker = require('simple-spellchecker');
const yesno = require('yesno');

const steward = process.argv.slice(2)[0];
if (!steward) {
    console.error('Missing steward');
    process.exit(1);
}
let dictionary: any;
spellChecker.getDictionary('en-US', (err: any, dic: any) => {
    if (!err) {
        dictionary = dic;
    }
});

process.on('unhandledRejection', (error) => {
    console.log(error);
});

const whitelistFile = './scripts/spellcheck.whitelist';
const blacklistFile = './scripts/spellcheck.blacklist';
let whitelist: string[] = [];
let blacklist: string[] = [];
async function addToList(term: string) {
    if (whitelist.indexOf(term) === -1) {
        whitelist.push(term);
        whitelist.filter((item, index) => whitelist.indexOf(item) === index);
        await writeFileSync(whitelistFile, whitelist, 'utf8');
    }
}

const errors: {ids: CdeId[], term: string, location: string}[] = [];
async function markAsError(term: string, cde: DataElement, location: string) {
    errors.push({ids: cde.ids, term, location});
    await writeFileSync('./scripts/spellcheck.json', JSON.stringify(errors), 'utf8');
    if (blacklist.indexOf(term) === -1) {
        blacklist.push(term);
        blacklist.filter((item, index) => whitelist.indexOf(item) === index);
        await writeFileSync(blacklistFile, blacklist, 'utf8');
    }

}

async function iterateOverValue(value: any, type: string, cde: DataElement) {
    const terms = value[type].replace(/([ *'|—="!…:_.,;(){}–\-?/\[\]]+)/g, '§sep§').split('§sep§');
    for (let term of terms) {
        if (!/\d/.test(term) && term.toUpperCase() !== term) {
            term = term.trim().toLowerCase();
            if (whitelist.indexOf(term) === -1) {
                const misspelled = !dictionary.spellCheck(term);
                if (misspelled) {
                    console.log(`\n${terms.join(' ')}\n`);
                    console.log(`${term} in tinyId: ${cde.tinyId}\n`);
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
                        await markAsError(term, cde, 'name');
                    }
                }
            }
        }
    }
}

async function run() {
    try {
        whitelist = await readFileSync(whitelistFile, 'utf8').split(',');
        blacklist = await readFileSync(blacklistFile, 'utf8').split(',');
    } catch (e) {}
    const cond = {'stewardOrg.name': steward,
        'registrationState.registrationStatus': {$ne: 'Retired'},
            archived: false};
    let cdeCount = await dataElementModel.countDocuments(cond);
    console.log(`TODO: ${cdeCount}`);
    const cursor = getStream(cond);
    cursor.eachAsync(async (cde: any) => {
        cdeCount--;

        for (const designation of cde.designations) {
            await iterateOverValue(designation, 'designation', cde);
        }

        for (const definition of cde.definitions) {
            await iterateOverValue(definition, 'definition', cde);
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
