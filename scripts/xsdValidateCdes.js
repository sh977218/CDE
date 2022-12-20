const fs = require('fs');
const validator = require('xsd-schema-validator');
const fetch = require('node-fetch');

/*
    Export a CDE search result as XML
 */

const filePath = '../SearchExport_XML';

async function run() {
    const allFiles = fs.readdirSync(filePath);

    let count = allFiles.length;
    for (const f in allFiles) {
        await new Promise((resolve, reject) => {
            validator.validateXML({file: `${filePath}/${allFiles[f]}`}, './shared/de/assets/dataElement.xsd', async err => {
                if (err) {
                    console.log(`*** Invalid File *** ${allFiles[f]}`);
                    throw err;
                }

                const tinyId = allFiles[f].split('.')[0];
                const res = await fetch(`https://cde.nlm.nih.gov/api/de/${tinyId}?type=xml`);
                const theXml = await res.text();
                validator.validateXML(theXml, './shared/de/assets/dataElement.xsd', async err => {
                    if (err) {
                        console.log(`*** Invalid XML Export *** ${allFiles[f]}`);
                        throw err;
                    }
                    console.log(count--);
                    fs.unlink(`${filePath}/${allFiles[f]}`, resolve);
                });

            });
        });
    }
}


run();
