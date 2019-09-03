import { runOrgs } from 'ingester/nci/loader/loadNci';

const cdmhPcoriCdmOrgNames = ['NCI-CDMH-PCORNet', 'NCI-CDMH-OMOP', 'NCI-CDMH-ACT', 'NCI-CDMH-Sentinel'];
//const cdmhPcoriCdmOrgNames = ['NCI-CDMH-PCORNet'];
runOrgs(cdmhPcoriCdmOrgNames).then(
    result => {
        console.log(result);
        console.log('Finished all cdmhPcoriCdmOrgs.');
        process.exit(0);
    },
    err => {
        console.log(err);
        process.exit(1);
    }
);
