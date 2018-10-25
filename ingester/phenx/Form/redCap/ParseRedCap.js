const AdmZip = require('adm-zip');

const zipFolder = '/s/MLB/CDE/phenx/original-phenxtoolkit.rti.org/toolkit_content/redcap_zip/';

exports.parseRedCap = async protocol => {
    let formElements = [];

    let protocolId = protocol.protocolId;
    let zipFile = 'PX' + protocolId + '.zip';
    try {
        let file = zipFolder + zipFile;
        let zip = new AdmZip(file);
    } catch (e) {
        console.log(e);
        process.exit(1);
    }
    let zipEntries = zip.getEntries();
    zipEntries.forEach(function (zipEntry) {
        console.log(zipEntry.toString()); // outputs zip entries information
        if (zipEntry.entryName == "my_file.txt") {
            console.log(zipEntry.getData().toString('utf8'));
        }
    });

    return formElements;
};