import { ProtocolModel } from 'ingester/createMigrationConnection';
import { runOnePhenX } from 'ingester/phenx/Website/phenxLoader';
import { getDomainCollectionSite } from 'ingester/shared/utility';

async function run() {
    const domainCollectionMap = await getDomainCollectionSite();
    const allProtocolIDs = Object.keys(domainCollectionMap);
    console.log(allProtocolIDs.length + ' protocol(s) need to be grabbed.');
    for (const protocolID of allProtocolIDs) {
        const existProtocol = await ProtocolModel.findOne({protocolID});
        if (!existProtocol) {
            const protocol = await runOnePhenX(protocolId);
            protocol.loadDate = new Date();
            await new ProtocolModel(protocol).save();
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

