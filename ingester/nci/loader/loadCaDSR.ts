import {runOrgs} from './loadNci';

runOrgs(['caDSR'])
    .then(() => {
            console.log('done run caDSR')
        },
        () => {
            console.log('error run caDSR')
        });