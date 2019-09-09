import { isEmpty, toLower, trim, words } from 'lodash';

const xlsxColumnToCsvColumn = {
    Group: 'Category/Group',
    'variable name': 'Variable Name',
    title: 'Title',
    'element type': 'Title Element',
    version: 'version',
    definition: 'Definition',
    'short description': 'Short Description',
    datatype: 'Datatype',
    'maximum character quantity': 'Maximum Character Quantity',
    'input restriction': 'Input Restriction',
    'minimum value': 'Minimum Value',
    'maximum value': 'Maximum Value',
    'permissible values': 'Permissible Values',
    'permissible value descriptions': 'Permissible Value Descriptions',
    'permissible value output codes': 'Permissible Value Output Codes',
    'Item Response OID': '',
    'Element OID': '',
    'unit of measure': 'Unit of Measure',
    'guidelines/instructions': 'Guidelines/Instructions',
    notes: 'Notes',
    'preferred question text': 'Preferred Question Text',
    keywords: 'Keywords',
    references: 'References',
    'population.all': 'Population.All',
    'domain.general (for all diseases)': '',
    'domain.traumatic brain injury': '',
    "domain.Parkinson's disease": '',
    "domain.Friedreich's ataxia": '',
    'domain.stroke': '',
    'domain.amyotrophic lateral sclerosis': '',
    "domain.Huntington's disease": '',
    'domain.multiple sclerosis': '',
    'domain.neuromuscular': '',
    diseases: '',
    'domain.myasthenia gravis': '',
    'domain.spinal muscular atrophy': '',
    'domain.Duchenne muscular dystrophy/Becker muscular dystrophy': '',
    'domain.congenital muscular dystrophy': '',
    'domain.spinal cord injury': '',
    'domain.headache': '',
    'domain.epilepsy': '',
    'classification.general (for all diseases)': '',
    'classification.acute hospitalized': '',
    'classification.concussion/mild TBI': '',
    'classification.epidemiology': '',
    'classification.moderate/severe TBI: rehabilitation': '',
    "classification.Parkinson's disease": "Classification.Parkinson's Disease",
    "classification.Friedreich's ataxia": "Classification.Friedreich's Ataxia",
    'classification.stroke': 'Classification.Stroke',
    'classification.amyotrophic lateral sclerosis': 'Classification.Amyotrophic Lateral Sclerosis',
    "classification.Huntington's disease": "Classification.Huntington's Disease",
    'classification.multiple sclerosis': 'Classification.Multiple Sclerosis',
    'classification.neuromuscular diseases': 'Classification.Neuromuscular Diseases',
    'classification.myasthenia gravis': 'Classification.Myasthenia Gravis',
    'classification.spinal muscular atrophy': 'Classification.Spinal Muscular atrophy',
    'classification.Duchenne muscular dystrophy/Becker muscular dystrophy': 'Classification.Duchenne Muscular Dystrophy/Becker Muscular Dystrophy',
    'classification.congenital muscular dystrophy': 'Classification.Congenital Muscular Dystrophy',
    'classification.spinal cord injury': 'Classification.Spinal cord Injury',
    'classification.headache': 'Classification.Headache',
    'classification.epilepsy': '',
    'historical notes': 'Historical Notes',
    'Label(s)': '',
    'see also': 'See Also',
    'submitting organization name': 'Submitting Organization Name',
    'submitting contact name': 'Submitting Contact Name',
    'submitting contact information': 'Submitting Contact Information',
    'effective date': 'Effective Date',
    'until date': 'Until Date',
    'steward organization name': 'Steward Organization Name',
    'steward contact name': 'Steward Contact Name',
    'steward contact information': 'Steward Contact Information',
    'creation date': '',
    'last change date': '',
    'administrative status': '',
    'CAT OID': '',
    'Form Item OID': ''
};

export function getCell(row: any, header: string) {
    const formattedHeader = words(toLower(header)).join('');
    if (!isEmpty(row[formattedHeader])) {
        return trim(row[formattedHeader]);
    } else if (header === 'Category/Group') {
        return trim(row.group);
    } else {
        return '';
    }
}

export function formatRows(rows: any[]) {
    const formattedRows: any[] = [];
    rows.forEach(row => {
        const formattedRow: any = {};
        for (const p in row) {
            if (row.hasOwnProperty(p)) {
                const formattedP = words(toLower(p)).join('');
                formattedRow[formattedP] = row[p];
            }
        }
        formattedRows.push(formattedRow);
    });
    return formattedRows.filter(r => !isEmpty(r.variablename) && !isEmpty(r.title));
}