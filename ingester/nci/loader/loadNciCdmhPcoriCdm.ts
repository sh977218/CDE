import { runOrgs } from 'ingester/nci/loader/loadNci';

const cdmhPcoriCdmOrgs = ['NCI-CDMH-PCORNet', 'NCI-CDMH-OMOP', 'NCI-CDMH-ACT', 'NCI-CDMH-Sentinel'];
runOrgs(cdmhPcoriCdmOrgs).then((err, result) => {
    if (err) console.log(err);
    else {
        console.log(result);
        console.log('Finished all cdmhPcoriCdmOrgs.');
    }
});