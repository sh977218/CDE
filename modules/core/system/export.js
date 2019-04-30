import { capString } from 'shared/system/util';

export function getCdeCsvHeader(settings) {
    let cdeHeader = "Name";

    if (settings.questionTexts) {
        cdeHeader += ", Question Texts";
    }
    if (settings.naming) {
        cdeHeader += ", Other Names";
    }
    if (settings.permissibleValues || settings.pvCodeNames) {
        cdeHeader += ", Value Type";
    }
    if (settings.permissibleValues) {
        cdeHeader += ", Permissible Values";
    }
    if (settings.pvCodeNames) {
        cdeHeader += ", Code Names";
    }
    if (settings.nbOfPVs) {
        cdeHeader += ", Nb of Permissible Values";
    }
    if (settings.uom) {
        cdeHeader += ", Unit of Measure";
    }
    if (settings.stewardOrg) {
        cdeHeader += ", Steward";
    }
    if (settings.usedBy) {
        cdeHeader += ", Used By";
    }
    if (settings.registrationStatus) {
        cdeHeader += ", Registration Status";
    }
    if (settings.administrativeStatus) {
        cdeHeader += ", Administrative Status";
    }
    if (settings.ids) {
        if (settings.identifiers.length > 0) {
            settings.identifiers.forEach(i => {
                cdeHeader = cdeHeader + ", " + i;
            });
        } else cdeHeader += ", Identifiers";
    }
    if (settings.source) {
        cdeHeader += ", Source";
    }
    if (settings.updated) {
        cdeHeader += ", Updated";
    }
    if (settings.tinyId) {
        cdeHeader += ", NLM ID";
    }
    if (settings.linkedForms) {
        cdeHeader += ", Forms";
    }
    cdeHeader += "\n";
    return cdeHeader;
}

export function projectFormForExport(ele) {
    const form = {
        name: ele.designations[0].designation
        , ids: ele.ids.map(function (id) {
            return id.source + ": " + id.id + (id.version ? " v" + id.version : "");
        })
        , stewardOrg: ele.stewardOrg.name
        , registrationStatus: ele.registrationState.registrationStatus
        , adminStatus: ele.registrationState.administrativeStatus
    };
    if (ele.classification) form.usedBy = ele.classification.map(function (c) {
        return c.stewardOrg.name;
    });
    return form;
}

export function projectCdeForExport(ele, settings) {
    let cde = {
        name: ele.designations[0].designation
    };
    if (settings.questionTexts) {
        cde.questionTexts = ele.designations.filter(function (n) {
            return n.tags.filter(function (t) {
                return t.indexOf("Question Text") > -1;
            }).length > 0;
        }).map(function (n) {
            return n.designation;
        }).filter(function (n) {
            return n;
        });
    }
    if (settings.naming) {
        cde.otherNames = ele.designations.filter(function (n) {
            return n.tags.filter(function (t) {
                return t.indexOf("Question Text") > -1;
            }).length === 0;
        }).map(function (n) {
            return n.designation;
        }).filter(function (n) {
            return n;
        });
    }
    if (settings.permissibleValues || settings.pvCodeNames) {
        cde.valueDomainType = ele.valueDomain.datatype;
    }
    if (settings.permissibleValues) {
        cde.permissibleValues = ele.valueDomain.permissibleValues.slice(0, 50).map(pv => pv.permissibleValue);
    }
    if (settings.pvCodeNames) {
        cde.pvCodeNames = ele.valueDomain.permissibleValues.slice(0, 50).map(pv => pv.valueMeaningName);
    }
    if (settings.nbOfPVs) {
        if (ele.valueDomain.permissibleValues) cde.nbOfPVs = ele.valueDomain.permissibleValues.length | 0;  // jshint ignore:line
    }
    if (settings.uom) {
        cde.uom = ele.valueDomain.uom;
    }
    if (settings.stewardOrg) {
        cde.stewardOrg = ele.stewardOrg.name;
    }
    if (settings.usedBy) {
        if (ele.classification) cde.usedBy = ele.classification.map(function (c) {
            return c.stewardOrg.name;
        });
    }
    if (settings.registrationStatus) {
        cde.registrationStatus = ele.registrationState.registrationStatus;
    }
    if (settings.administrativeStatus) {
        cde.administrativeStatus = ele.registrationState.administrativeStatus;
    }
    if (settings.ids) {
        if (settings.identifiers.length > 0) {
            settings.identifiers.forEach(i => {
                cde[i] = "";
                ele.ids.forEach(id => {
                    if (id.source === i) cde[i] = id.id + (id.version ? " v" + id.version : "");
                });
            });
        } else cde.ids = ele.ids.map(function (id) {
            return id.source + ": " + id.id + (id.version ? " v" + id.version : "");
        });
    }
    if (settings.source) {
        cde.source = ele.source;
    }
    if (settings.updated) {
        cde.updated = ele.updated;
    }
    if (settings.tinyId) {
        cde.tinyId = ele.tinyId;
    }
    if (settings.linkedForms) {
        cde.linkedForms = ele.linkedForms;
    }

    return cde;
}

function sanitize(v) {
    return (v && v.trim) ? v.trim().replace(/"/g, "\"\"") : v;
}

export function convertToCsv(obj) {
    let row = "";
    Object.keys(obj).forEach(function (key) {
        row += '"';
        let value = obj[key];
        if (Array.isArray(value)) {
            row += value.map(function (value) {
                return sanitize(value);
            }).join("; ");
        } else if (value !== undefined) {
            row += sanitize(value);
        }
        row += '",';
    });
    return row + '\n';
}
