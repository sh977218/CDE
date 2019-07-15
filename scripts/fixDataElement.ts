import { isEmpty } from 'lodash';
import { DataElement } from '../server/cde/mongo-cde';

process.on('unhandledRejection', function (error) {
    console.log(error);
});

export function fixValueDomain(cde) {
    let cdeObj = cde.toObject();
    if (!cdeObj.valueDomain.datatype) {
        cdeObj.valueDomain.datatype = 'Text';
    }
    let datatype = cdeObj.valueDomain.datatype;
    const myProps = [
        'datatypeText',
        'datatypeNumber',
        'datatypeDate',
        'datatypeTime',
        'datatypeExternallyDefined',
        'datatypeValueList',
        'datatypeDynamicCodeList'
    ];
    let checkType = datatype.replace(/\s+/g, ' ');
    checkType = `datatype${checkType}`;

    if (datatype === 'Text') {
        if (!isEmpty(cdeObj.valueDomain.datatypeText)) {
            cdeObj.valueDomain.datatypeText = fixDatatypeText(cdeObj.valueDomain.datatypeText);
        }
    }
    if (datatype === 'Value List') {
        cdeObj.valueDomain.permissibleValues = fixEmptyPermissibleValue(cdeObj.valueDomain.permissibleValues);
    }
    myProps.filter(e => e !== checkType).forEach(p => {
        delete cdeObj.valueDomain[p];
    });
    cdeObj.valueDomain[`datatype${checkType}`] = {};

    cde.valueDomain = cdeObj.valueDomain;
}

function fixDatatypeText(datatypeText) {
    let minLengthString = datatypeText.minLength;
    let minLength = parseInt(minLengthString);
    let maxLengthString = datatypeText.maxLength;
    let maxLength = parseInt(maxLengthString);
    let result: any = {};
    if (!isNaN(minLength)) {
        result.minLength = minLength;
    }
    if (!isNaN(maxLength)) {
        result.maxLength = maxLength;
    }
    return result;
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

function fixEmptyPermissibleValue(permissibleValues) {
    let result = [];
    permissibleValues.forEach(pv => {
        if (!pv.permissibleValue) {
            pv.permissibleValue = pv.valueMeaningName;
        }
        if (!pv.valueMeaningName) {
            pv.valueMeaningName = pv.permissibleValue;
        }
        result.push(pv);
    });
    return result.filter(pv => !isEmpty(pv.permissibleValue));
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
//        tinyId: 'QyGOTdNnq4X',
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