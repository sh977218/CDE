import { readFile } from 'fs';
import { isEmpty, uniqWith, unionWith, isEqual } from 'lodash';
import { parseString } from 'xml2js';
import { dataElementModel } from 'server/cde/mongo-cde';
import { parseAnswers } from 'ingester/ninds/website/cde/ParseValueDomain';

const NINDS_XML_PATH = 'S:/MLB/CDE/NINDS/11-20-2019/Forms_Report_20190910.xml';
let formCdeOrderMap = {};

async function getFormCdeOrder() {
    return new Promise((resolve, reject) => {
        if (!isEmpty(formCdeOrderMap)) {
            resolve(formCdeOrderMap);
        } else {
            readFile(NINDS_XML_PATH, (fsErr, data) => {
                if (fsErr) {
                    reject(fsErr);
                } else {
                    parseString(data, (err, result) => {
                        if (err) {
                            reject(err);
                        } else {
                            result.dataStructureExport.dataStructure =
                                uniqWith(result.dataStructureExport.dataStructure, (a: any, b: any) => {
                                    delete a.description;
                                    delete b.description;
                                    return isEqual(a, b);
                                });
                            formCdeOrderMap = result;
                            resolve(formCdeOrderMap);
                        }
                    });
                }
            });
        }
    });
}

function removeExtraField(f: any) {
    delete f._id;
    delete f.url;
    delete f.diseaseName;
    delete f.subDiseaseName;
    delete f.domainName;
    delete f.subDomainName;
    for (const c of f.cdes) {
        delete c['Sub Domain Name'];
        delete c['Domain Name'];
        delete c.Population;
        delete c.Classification;
    }
}

async function validateNindsForms(nindsForms: any[]) {
    const temp: any = await getFormCdeOrder();
    const dataStructures = temp.dataStructureExport.dataStructure.filter((ds: any) => {
        return ds.title.indexOf(nindsForms[0].formName) !== -1;
    });
    const formCdeSortingArrays = dataStructures.filter((ds: any) => {
        return ds.diseaseList.filter((dl: any) => {
            return dl.disease.filter((d: any) => {
                const i = d.name.indexOf(nindsForms[0].diseaseName);
                return i !== -1;
            }).length > 0;
        }).length > 0;
    });
    if (formCdeSortingArrays.length !== 1) {
        console.log(`form ${nindsForms[0].formName} ${nindsForms[0].formId} form cde order xml not found.`);
        process.exit(1);
    }
    const formCdeSortingArray = formCdeSortingArrays[0];
    const sortingArray = formCdeSortingArray.repeatableGroups[0].mapElements.map((o: any) => o.dataElement[0].name[0]);
    nindsForms.forEach(f => f.cdes.sort((a: any, b: any) => {
            return sortingArray.indexOf(a['Variable Name']) - sortingArray.indexOf(b['Variable Name']);
        }
    ));
    const uniqNindsForms = unionWith(nindsForms, (f1, f2) => {
        removeExtraField(f1);
        removeExtraField(f2);
        return isEqual(f1, f2);
    });
    if (uniqNindsForms.length !== 1) {
        console.log(`form ${nindsForms[0].formId} has multiple different forms`);
        process.exit(1);
    }
}

export async function parseFormElements(nindsForms: any[]) {
//    await validateNindsForms(nindsForms);

    const nindsForm = nindsForms[0];
    const formElements: any[] = [];

    if (isEmpty(nindsForm.cdes)) {
        return formElements;
    } else {
        formElements.push({
            elementType: 'section',
            instructions: {value: ''},
            label: '',
            formElements: []
        });
        for (const nindsCde of nindsForm.cdes) {
            const cdeId = nindsCde['CDE ID'];
            const existingCde: any = await dataElementModel.findOne({
                archived: false,
                'ids.id': cdeId,
                'registrationState.registrationStatus': {$ne: 'Retired'}
            });
            if (!existingCde) {
                console.log(cdeId + ' cde not exist.');
                process.exit(1);
            }
            const question: any = {
                cde: {
                    tinyId: existingCde.tinyId,
                    name: existingCde.designations[0].designation,
                    designations: existingCde.designations,
                    version: existingCde.version,
                    ids: existingCde.ids
                },
                datatype: existingCde.valueDomain.datatype,
                uom: existingCde.valueDomain.uom
            };

            if (question.datatype === 'Value List') {
                question.answers = parseAnswers(nindsCde);
                question.cde.permissibleValues = existingCde.valueDomain.permissibleValues;
                question.multiselect = nindsCde['Input Restrictions'] === 'Multiple Pre-Defined Values Selected';
            } else if (question.datatype === 'Text') {
                question.datatypeText = existingCde.valueDomain.datatypeText;
            } else if (question.datatype === 'Number') {
                question.datatypeNumber = existingCde.valueDomain.datatypeNumber;
            } else if (question.datatype === 'Date') {
                question.datatypeDate = {
                    precision: 'Minute'
                };
            } else if (question.datatype === 'File') {
                question.datatypeDate = existingCde.valueDomain.datatypeDate;
            } else {
                console.log('Unknown question.datatype: ' + question.datatype + ' cde id: ' + existingCde.ids[0].id);
                process.exit(1);
            }


            const questionText = nindsCde['Additional Notes (Question Text)'];
            const diseaseSpecificInstructions = nindsCde['Disease Specific Instructions'];

            const questionFe = {
                elementType: 'question',
                label: questionText === 'N/A' ? '' : questionText,
                instructions: {value: diseaseSpecificInstructions},
                question,
                formElements: []
            };
            formElements[0].formElements.push(questionFe);
        }
        return formElements;
    }
}
