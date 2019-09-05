import { generateTinyId } from 'server/system/mongo-data';
import { DataElement } from 'server/cde/mongo-cde';
import { Form } from 'server/form/mongo-form';
import { filter, toLower, uniqBy, words } from 'lodash';

export async function loadFormByCsv(rows){
    const allFormsArray = uniqBy(rows, 'Form');
    for (const oneform of allFormsArray) {
        const form = {
            tinyId: generateTinyId(),
            stewardOrg: {
                name: 'NINDS'
            },
            naming: [
                {designation: words(oneForm.Form).join(' ')}
            ],
            registrationState: {
                registrationStatus: 'Recorded'
            },
            createdBy: {
                username: 'batchloader'
            },
            referenceDocuments: [],
            properties: [],
            formElements: [],
            classification: [{
                stewardOrg: {name: 'NINDS'},
                elements: [{
                    name: 'Preclinical TBI',
                    elements: []
                }]
            }]
        };
        let lastSection = '';
        let currentSection = '';
        let formElements = form.formElements;
        const oneFormArray = filter(rows, r => r.Form === oneForm.Form);
        for (const row of oneFormArray) {
            const variableName = row['Variable Name'].trim();
            const existingDE = await DataElement.findOne({'ids.id': variableName});
            currentSection = getCell(row, 'Category/Group');
            if (currentSection !== lastSection) {
                const newSection = {
                    elementType: 'section',
                    label: currentSection,
                    formElements: []
                };
                form.formElements.push(newSection);
                formElements = newSection.formElements;
            }
            if (existingDE) {
                const question = deToQuestion(row, existingDE);
                formElements.push(question);
                lastSection = currentSection;
            } else {
                rowToDataElement(row, form, (err, de) => {
                    if (err) {
                        throw err;
                    } else {
                        new DataElement(de).save((err, newCde) => {
                            if (err) {
                                throw err;
                            } else {
                                const question = deToQuestion(row, newCde);
                                formElements.push(question);
                                lastSection = currentSection;
                                deCount++;
                                console.log('deCount: ' + deCount);
                                doneOneRow();
                            }
                        });
                    }
                });
            }
        }
        form.referenceDocuments = uniqBy(form.referenceDocuments, 'uri');
        await new Form(form).save();
    }
}