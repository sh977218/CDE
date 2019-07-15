import { DataElement } from '../server/cde/mongo-cde';

process.on('unhandledRejection', function (error) {
    console.log(error);
});

export function fixValueDomain(cde) {
    let cdeObj = cde.toObject();
    const myProps = [
        'datatypeText',
        'datatypeNumber',
        'datatypeDate',
        'datatypeTime',
        'datatypeExternallyDefined',
        'datatypeValueList',
        'datatypeDynamicCodeList'
    ];
    let checkType = cdeObj.datatype.replace(/\s+/g, ' ');
    checkType = `datatype${checkType}`;

    myProps.filter(e => e !== checkType).forEach(p => {
        if (checkType === 'Text') {
            cdeObj.valueDomain.datatypeText = fixDatatypeText(cdeObj.valueDomain.datatypeText);
        }
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
    return {minLength, maxLength};
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
        'valueDomain.datatype': 'Text',
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