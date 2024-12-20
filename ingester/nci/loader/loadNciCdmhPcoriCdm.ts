import {runOrgs} from '../loader/loadNci';

const cdmhPcoriCdmOrgNames = ['NCI-CDMH-PCORNet', 'NCI-CDMH-OMOP', 'NCI-CDMH-ACT', 'NCI-CDMH-Sentinel'];
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
