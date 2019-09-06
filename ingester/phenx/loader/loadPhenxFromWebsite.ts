import { ProtocolModel } from 'ingester/createMigrationConnection';
import { runOnePhenX } from 'ingester/phenx/Website/phenxLoader';
import { getDomainCollection } from 'ingester/shared/utility';

(async () => {
    const DomainCollectionMap = await getDomainCollection();
    const allProtocolIds = Object.keys(DomainCollectionMap);
    console.log(allProtocolIds.length + ' protocol(s) need to be grabbed.');
    for (const protocolId of allProtocolIds) {
        const existProtocol = await ProtocolModel.findOne({protocolId});
        if (!existProtocol) {
            const protocol = await runOnePhenX(protocolId);
            await new ProtocolModel(protocol).save();
            console.log(protocolId + ' saved.');
        } else {
            console.log(protocolId + ' exists. skip...');
        }
    }
    console.log('Finished.');
})();
