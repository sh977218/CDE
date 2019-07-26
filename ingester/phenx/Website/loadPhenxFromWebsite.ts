import { ProtocolModel } from 'ingester/createMigrationConnection';
import { runOnePhenX } from 'ingester/phenx/Website/phenxLoader';
import { getDomainCollection } from 'ingester/shared/utility';

(async function () {
    let DomainCollectionMap = await getDomainCollection();
    let allProtocolIds = Object.keys(DomainCollectionMap);
    console.debug(allProtocolIds.length + ' protocol(s) need to be grabbed.');
    for (let protocolId of allProtocolIds) {
        let existProtocol = await ProtocolModel.findOne({protocolId: protocolId});
        if (!existProtocol) {
            let protocol = await runOnePhenX(protocolId);
            await new ProtocolModel(protocol).save();
            console.debug(protocolId + ' saved.');
        } else {
            console.debug(protocolId + ' exists. skip...');
        }
    }
    console.info('Finished.');
})();