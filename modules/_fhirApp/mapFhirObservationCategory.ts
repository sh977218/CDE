import { CdeForm } from 'shared/form/form.model';

export let mapObservationCategory = [
    {
        panel: '72513-5',  // https://r.details.loinc.org/LOINC/72513-5.html?sections=Comprehensive
        observationCategory: 'vital-signs',
        system: 'LOINC',
        codes: ['8310-5', '8462-4', '8480-6', '8867-4', '8302-2', '9279-1', '3141-9', '8287-5', '72166-2', '72514-3']
    },
    {
        panel: '74728-7', // https://r.details.loinc.org/LOINC/74728-7.html?sections=Comprehensive
        observationCategory: 'vital-signs',
        system: 'LOINC',
        codes: ['59408-5', '3141-9', '8287-5', '8302-2', '8306-3', '8310-5', '8462-4', '8480-6', '8867-4', '9279-1', '3140-1', '39156-5']
    }
];
