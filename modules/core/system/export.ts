import { DataElementElastic, ValueDomainValueList } from 'shared/de/dataElement.model';
import { ItemElastic, PermissibleValue, TableViewFields } from 'shared/models.model';

export function getCdeCsvHeader(settings: TableViewFields): string {
    let cdeHeader = 'Name';

    if (settings.questionTexts) {
        cdeHeader += ', Question Texts';
    }
    if (settings.naming) {
        cdeHeader += ', Other Names';
    }
    if (settings.permissibleValues || settings.pvCodeNames) {
        cdeHeader += ', Value Type';
    }
    if (settings.permissibleValues) {
        cdeHeader += ', Permissible Values';
    }
    if (settings.pvCodeNames) {
        cdeHeader += ', Code Names';
    }
    if (settings.nbOfPVs) {
        cdeHeader += ', Nb of Permissible Values';
    }
    if (settings.uom) {
        cdeHeader += ', Unit of Measure';
    }
    if (settings.stewardOrg) {
        cdeHeader += ', Steward';
    }
    if (settings.usedBy) {
        cdeHeader += ', Used By';
    }
    if (settings.registrationStatus) {
        cdeHeader += ', Registration Status';
    }
    if (settings.administrativeStatus) {
        cdeHeader += ', Administrative Status';
    }
    if (settings.ids) {
        if (settings.identifiers && settings.identifiers.length > 0) {
            settings.identifiers.forEach(i => {
                cdeHeader = cdeHeader + ', ' + i;
            });
        } else {
            cdeHeader += ', Identifiers';
        }
    }
    if (settings.source) {
        cdeHeader += ', Source';
    }
    if (settings.updated) {
        cdeHeader += ', Updated';
    }
    if (settings.tinyId) {
        cdeHeader += ', NLM ID';
    }
    if (settings.linkedForms) {
        cdeHeader += ', Forms';
    }
    cdeHeader += '\n';
    return cdeHeader;
}

export function projectItemForExport(ele: ItemElastic, settings?: TableViewFields): any {
    const cde: any = {
        name: ele.designations[0].designation,
    };
    if (settings && settings.questionTexts) {
        cde.questionTexts = ele.designations
            .filter(n => (n.tags || []).filter(t => t.indexOf('Question Text') > -1).length > 0)
            .map(n => n.designation)
            .filter(n => n);
    }
    if (settings && settings.naming) {
        cde.otherNames = ele.designations
            .filter(n => (n.tags || []).filter(t => t.indexOf('Question Text') > -1).length === 0)
            .map(n => n.designation)
            .filter(n => n);
    }
    if (settings && (settings.permissibleValues || settings.pvCodeNames)) {
        cde.valueDomainType = (ele as DataElementElastic).valueDomain.datatype;
    }
    const pvs = ((ele as DataElementElastic).valueDomain as ValueDomainValueList).permissibleValues;
    if (settings && settings.permissibleValues) {
        cde.permissibleValues = (pvs || []).slice(0, 50).map((pv: PermissibleValue) => pv.permissibleValue);
    }
    if (settings && settings.pvCodeNames) {
        cde.pvCodeNames = (pvs || []).slice(0, 50).map((pv: PermissibleValue) => pv.valueMeaningName);
    }
    if (settings && settings.nbOfPVs) {
        cde.nbOfPVs = pvs?.length || 0;
    }
    if (settings && settings.uom) {
        cde.uom = (ele as DataElementElastic).valueDomain.uom;
    }
    if (!settings || settings.stewardOrg) {
        cde.stewardOrg = ele.stewardOrg.name;
    }
    if (!settings || settings.usedBy) {
        if (ele.classification) {
            cde.usedBy = ele.classification.map(c => c.stewardOrg.name);
        }
    }
    if (!settings || settings.registrationStatus) {
        cde.registrationStatus = ele.registrationState.registrationStatus;
    }
    if (!settings || settings.administrativeStatus) {
        cde.administrativeStatus = ele.registrationState.administrativeStatus;
    }
    if (!settings || settings.ids) {
        if (settings && settings.identifiers && settings.identifiers.length > 0) {
            settings.identifiers.forEach(i => {
                cde[i] = '';
                ele.ids.forEach(id => {
                    if (id.source === i) {
                        cde[i] = id.id + (id.version ? ' v' + id.version : '');
                    }
                });
            });
        } else {
            cde.ids = ele.ids.map(id => id.source + ': ' + id.id + (id.version ? ' v' + id.version : ''));
        }
    }
    if (settings && settings.source) {
        cde.source = ele.source;
    }
    if (settings && settings.updated) {
        cde.updated = ele.updated;
    }
    if (settings && settings.tinyId) {
        cde.tinyId = ele.tinyId;
    }
    if (settings && settings.linkedForms) {
        cde.linkedForms = (ele as DataElementElastic).linkedForms;
    }

    return cde;
}

function sanitize(v?: string | any) {
    return v && v.trim ? v.trim().replace(/"/g, '""') : v;
}

export function convertToCsv(obj: any): string {
    let row = '';
    Object.keys(obj).forEach(key => {
        row += '"';
        const value = obj[key];
        if (Array.isArray(value)) {
            row += value
                .map(value => {
                    return sanitize(value);
                })
                .join('; ');
        } else if (value !== undefined) {
            row += sanitize(value);
        }
        row += '",';
    });
    return row + '\n';
}
