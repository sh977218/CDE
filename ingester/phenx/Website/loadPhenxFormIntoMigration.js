var MigrationProtocolModel = require('../../createMigrationConnection').MigrationProtocolModel;
var MigrationRedcapModel = require('../../createMigrationConnection').MigrationRedcapModel;
var MigrationFormModel = require('../../createMigrationConnection').MigrationFormModel;

var protocolCount = 0;

var stream = MigrationProtocolModel.find({}).stream();
stream.on('data', (protocol) => {
    stream.pause();
    protocolCount++;
    if (protocol.toObject) protocol = protocol.toObject();
    var phenxId = 'PX' + protocol['protocolId'];
    MigrationRedcapModel.find({instrumentId: phenxId}).exec((err, foundRedcaps) => {
        if (err) throw err;
        else if (foundRedcaps.length === 0) {
            stream.resume();
        } else if (foundRedcaps.length === 1) {
            var redcap = foundRedcaps[0].toObject();
            stream.resume();
        } else {
            console.log('found too many redcap with ' + phenxId + ' in Redcap collection');
            process.exit(1);
        }
    })
});

stream.on('error', (err)=> {
    if (err)throw err;
});

stream.on('end', ()=> {
    console.log('end stream');
    console.log('protocolCount: ' + protocolCount);
    process.exit(1);
});