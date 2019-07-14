import { isEmpty } from 'lodash';
import { DataElement } from '../server/cde/mongo-cde';
import { ValueDomainNumber } from "shared/de/valueDomain/ValueDomainNumber";
import { ValueDomainTime } from "shared/de/valueDomain/ValueDomainTime";
import { ValueDomainDynamicCodeList } from "shared/de/valueDomain/ValueDomainDynamicCodeList";
import { ValueDomainExternallyDefined } from "shared/de/valueDomain/ValueDomainExternallyDefined";
import { ValueDomainValueList } from "shared/de/valueDomain/ValueDomainValueList";
import { ValueDomain } from "shared/de/valueDomain/ValueDomain";
import { DataTypeText } from "shared/de/valueDomain/DataTypeText";
import { DataTypeDate } from "shared/de/valueDomain/DataTypeDate";
import { DataTypeExternallyDefined } from "shared/de/valueDomain/DataTypeExternallyDefined";

process.on('unhandledRejection', function (error) {
    console.log(error);
});

export function fixValueDomain(cde) {
    let cdeObj = cde;
    if (cde.toObject) cdeObj = cde.toObject();
    let datatype = cdeObj.valueDomain.datatype;
    let valueDomain = cdeObj.valueDomain;
    cde.valueDomain = new ValueDomain(valueDomain);
    if (datatype === 'Text') {
        if (!isEmpty(valueDomain.datatypeText)) {
            cde.valueDomain.datatypeText = new DataTypeText(valueDomain.datatypeText);
        }
    } else if (datatype === 'Date') {
        if (!isEmpty(valueDomain.datatypeDate)) {
            cde.valueDomain.datatypeDate = new DataTypeDate(valueDomain.datatypeDate);
        }
    } else if (datatype === 'Number') {
        cde.valueDomain = new ValueDomainNumber(valueDomain);
    } else if (datatype === 'Time') {
        cde.valueDomain = new ValueDomainTime(valueDomain);
    } else if (datatype === 'Dynamic Code List') {
        cde.valueDomain = new ValueDomainDynamicCodeList(valueDomain);
    } else if (datatype === 'Externally Defined') {
        if (!isEmpty(valueDomain.datatypeDate)) {
            cde.valueDomain.dataTypeExternallyDefined = new DataTypeExternallyDefined(valueDomain.dataTypeExternallyDefined);
        }
    } else if (datatype === 'Value List') {
        cde.valueDomain = new ValueDomainValueList(valueDomain);
    } else if (datatype === 'File') {
        console.log('define this.');
        process.exit(1);
    } else if (datatype === 'Geo Location') {
        console.log('define this.');
        process.exit(1);
    }
}

function fixDatatypeText(cde) {
    if (cde.valueDomain.datatype === 'Text') {
        let cdeObj = cde.toObject();
        let minLengthString = cdeObj.valueDomain.datatypeText.minLength;
        let minLength = parseInt(minLengthString);
        let maxLengthString = cdeObj.valueDomain.datatypeText.maxLength;
        let maxLength = parseInt(maxLengthString);
        cde.valueDomain.datatypeText = {minLength, maxLength};
    }
}

function fixSourceName(cde) {
    let cdeObj = cde.toObject();
    cdeObj.sources.forEach(s => {
        if (!s.sourceName) {
            if (cdeObj.stewardOrg.name === 'LOINC' && s.registrationStatus === 'Active') {
                s.sourceName = 'LOINC';
            }
        }
    });
    cde.sources = cdeObj.sources;
}

function fixCreated(cde) {
    let defaultDate = new Date();
    defaultDate.setFullYear(1969, 1, 1);
    cde.created = defaultDate;
}

function fixCreatedBy(cde) {
    cde.createdBy = {
        username: 'nobody'
    };
}

function fixEmptyDesignation(cde) {
    let cdeObj = cde.toObject();
    cde.designations = cdeObj.designations.filter(d => d.designation);
}

function fixEmptyPermissibleValue(cde) {
    let cdeObj = cde.toObject();
    cdeObj.valueDomain.permissibleValues.forEach(pv => {
        if (!pv.permissibleValue) {
            pv.permissibleValue = pv.valueMeaningName;
        }
    });
    cde.valueDomain.permissibleValues = cdeObj.valueDomain.permissibleValues.filter(pv => pv.permissibleValue);
}

function fixError(cde) {
    if (!cde.createdBy) {
        fixCreatedBy(cde);
    }
    if (!cde.created) {
        fixCreated(cde);
    }
    fixValueDomain(cde);
    fixEmptyDesignation(cde);
    fixSourceName(cde);
}

(function () {
    let cdeCount = 0;
    let cursor = DataElement.find({
        lastMigrationScript: {$ne: 'fixDataElement'},
        archived: false,
        'registrationState.registrationStatus': {$ne: "Retired"}
    }).cursor();
    cursor.eachAsync(async (cde: any) => {
        cde.lastMigrationScript = 'fixDataElement';
        fixError(cde);
        await cde.save().catch(error => {
            throw(`${cde.tinyId} ${error}`);
        });
        cdeCount++;
        console.log(`cdeCount: ${cdeCount}`);
    });
    cursor.on('error', e => {
        console.log(e);
        process.exit(1);
    });
    cursor.on('close', () => {
        console.log('finished.');
        process.exit(0);
    });
})();