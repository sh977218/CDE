import {runOnePhenX} from 'ingester/phenx/Website/phenxLoader';

const protocolId = '641001';

async function run() {
    await PROTOCOL.remove({protocolId});
    console.log('Removed Migration Protocol collection');
    console.log(`Starting fetching Protocol ${protocolId}`);
    const protocol = await runOnePhenX(protocolId);
    console.log(`Finished fetching Protocol ${protocolId}`);
    await new PROTOCOL(protocol).save();
    console.log(`Finished saving Protocol ${protocolId}`);
}

run().then(() => process.exit(0), err => {
    console.log(err);
    process.exit(1);
});