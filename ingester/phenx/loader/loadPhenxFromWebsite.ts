import { PROTOCOL } from 'ingester/createMigrationConnection';
import { runOnePhenX } from 'ingester/phenx/Website/phenxLoader';
import { getDomainCollectionSite } from 'ingester/shared/utility';

async function run() {
    const domainCollectionMap = await getDomainCollectionSite();
    const allProtocolIds = Object.keys(domainCollectionMap);
    console.log(allProtocolIds.length + ' protocol(s) need to be grabbed.');
    for (const protocolId of allProtocolIds) {
        const existProtocol = await PROTOCOL.findOne({protocolID: protocolId});
        if (!existProtocol) {
            const protocol = await runOnePhenX(protocolId);
            protocol.loadDate = new Date();
            await new PROTOCOL(protocol).save();
            console.log(protocolId + ' saved.');
        } else {
            console.log(protocolId + ' exists. skip...');
        }
    }
}

run().then(() => {
        console.log('Finished.');
        process.exit(0);
    }, err => {
        console.log('err: +' + err);
        process.exit(1);
    }
);

