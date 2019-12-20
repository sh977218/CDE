export const valueSets = new Map<string, {name: string, codes: Map<string, string>}>();

valueSets.set('http://hl7.org/fhir/observation-category', {
    name: 'Observation Category Codes',
    codes: new Map([
        ['exam', 'Exam'],
        ['imaging', 'Imaging'],
        ['laboratory', 'Laboratory'],
        ['procedure', 'Procedure'],
        ['social-history', 'Social History'],
        ['survey', 'Survey'],
        ['therapy', 'Therapy'],
        ['vital-signs', 'Vital Signs']
    ])
});
