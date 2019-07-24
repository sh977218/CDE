import { DataElementService } from 'cde/public/dataElement.service';
import { CodeAndSystem, ObjectId } from 'shared/models.model';
import { DataElement } from 'shared/de/dataElement.model';
import { CdeForm, FormQuestion } from 'shared/form/form.model';

export class FormService {
    // TODO: use Mongo cde and move to shared, currently open to using Elastic cde
    static convertCdeToQuestion(de: DataElement, cb: (q?: FormQuestion) => void): void {
        if (!de || de.valueDomain === undefined) {
            throw new Error('Cde ' + de.tinyId + ' is not valid');
        }

        const q = new FormQuestion();
        q.question.cde.derivationRules = de.derivationRules;
        q.question.cde.name = de.designations[0] ? de.designations[0].designation : '';
        q.question.cde.designations = de.designations;
        q.question.cde.definitions = de.definitions;
        q.question.cde.tinyId = de.tinyId;
        q.question.cde.version = de.version;
        q.question.datatype = de.valueDomain.datatype;

        switch (de.valueDomain.datatype) {
            case 'Value List':
                q.question.answers = [];
                q.question.cde.permissibleValues = [];
                break;
            case 'Date':
                q.question.datatypeDate = de.valueDomain.datatypeDate || {};
                break;
            case 'Dynamic Code List':
                q.question.datatypeDynamicCodeList = de.valueDomain.datatypeDynamicCodeList || {};
                break;
            case 'Geo Location':
            case 'Time':
            case 'Externally Defined':
            case 'File':
                break;
            case 'Number':
                q.question.datatypeNumber = de.valueDomain.datatypeNumber || {};
                break;
            case 'Text':
            default:
                q.question.datatypeText = de.valueDomain.datatypeText || {};
                break;
        }

        if (de.ids) {
            q.question.cde.ids = de.ids;
        }
        if (de.valueDomain.uom) {
            q.question.unitsOfMeasure.push(new CodeAndSystem('', de.valueDomain.uom));
        }

        de.designations.forEach(n => {
            if (Array.isArray(n.tags) && n.tags.indexOf('Question Text') > -1 && !q.label) {
                q.label = n.designation;
            }
        });
        if (!q.label) {
            q.label = de.designations[0].designation;
        }

        function convertPv(q: FormQuestion, cde: DataElement) {
            cde.valueDomain.permissibleValues!.forEach(pv => {
                if (!pv.valueMeaningName || pv.valueMeaningName.trim().length === 0) {
                    pv.valueMeaningName = pv.permissibleValue;
                }
                q.question.answers!.push(Object.assign({formElements: []}, pv));
                q.question.cde.permissibleValues!.push(pv);
            });
        }
        if (de.valueDomain.permissibleValues && de.valueDomain.permissibleValues.length > 0) {
            // elastic only store 10 pv, retrieve pv when have more than 9 pv.
            if (de.valueDomain.permissibleValues.length > 9) {
                DataElementService.fetchDe(de.tinyId, de.version || '').then(de => {
                    convertPv(q, de);
                    cb(q);
                }, cb);
            } else {
                convertPv(q, de);
                cb(q);
            }
        } else {
            cb(q);
        }
    }

    static convertUnits(value: number, from: string, to: string): Promise<number> {
        return fetch('/ucumConvert?value=' + value + '&from=' + from + '&to=' + to)
            .then(res => res.text())
            .then(value => parseFloat(value));
    }

    static fetchForm(tinyId: string, version?: string): Promise<CdeForm> {
        return fetch('/form/' + tinyId + (version || version === '' ? '/version/' + version : ''))
            .then(res => res.json());
    }

    static fetchFormById(id: ObjectId): Promise<CdeForm> {
        return fetch('/formById/' + id)
            .then(res => res.json());
    }
}
