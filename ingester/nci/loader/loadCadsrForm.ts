import 'server/globals';
import {loadFormFromXml} from '../Form/form';

const orgName = 'caDSR Standard Brief Fatigue Inventory'

loadFormFromXml(orgName)
    .then(
        () => {
            console.log('done run caDSR form.')
            process.exit(0);
        },
        (e) => {
            console.log(`error run caDSR form. ${e}`)
            process.exit(1);
        }
    );