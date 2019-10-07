import { isEmpty } from 'lodash';
import { dataElementModel } from 'server/cde/mongo-cde';

process.on('unhandledRejection', (error) => {
    console.log(error);
});

function fixDatatypeExternallyDefined(datatypeExternallyDefined) {
    const linkString = datatypeExternallyDefined.link + '';
    const link = linkString.trim();

    const descriptionString = datatypeExternallyDefined.description + '';
    const description = descriptionString.trim();

    const descriptionFormatString = datatypeExternallyDefined.descriptionFormat + '';
    const descriptionFormat = descriptionFormatString.trim();

    const result: any = {};
    if (link) {
        result.link = link;
    }
    if (description) {
        result.description = description;
    }
    if (descriptionFormat) {
        result.descriptionFormat = descriptionFormat;
    }
    return result;
}

function fixDatatypeValueList(datatypeValueList) {
    const datatypeString = datatypeValueList.datatype + '';
    const datatype = datatypeString.trim();

    const result: any = {};
    if (datatype) {
        result.datatype = datatype;
    }
    return result;
}

function fixDatatypeDynamicCodeList(datatypeDynamicCodeList) {
    const systemString = datatypeDynamicCodeList.system + '';
    const system = systemString.trim();

    const codeString = datatypeDynamicCodeList.code + '';
    const code = codeString.trim();

    const result: any = {};
    if (system) {
        result.system = system;
    }
    if (code) {
        result.code = code;
    }
    return result;
}

function fixDatatypeTime(datatypeTime) {
    const formatString = datatypeTime.format + '';
    const format = formatString.trim();

    const result: any = {};
    if (format) {
        result.format = format;
    }
    return result;
}

function fixDatatypeDate(datatypeDate) {
    const precisionString = datatypeDate.precision + '';
    const precision = precisionString.trim();

    const result: any = {};
    if (precision) {
        result.precision = precision;
    }
    return result;
}

function fixDatatypeNumber(datatypeNumber) {
    const minValueString = datatypeNumber.minValue;
    const minValue = parseInt(minValueString, 10);

    const maxValueString = datatypeNumber.maxValue;
    const maxValue = parseInt(maxValueString, 10);

    const result: any = {};
    if (!isNaN(minValue)) {
        result.minValue = minValue;
    }
    if (!isNaN(maxValue)) {
        result.maxValue = maxValue;
    }
    return result;
}

function fixDatatypeText(datatypeText) {
    const minLengthString = datatypeText.minLength;
    const minLength = parseInt(minLengthString, 10);

    const maxLengthString = datatypeText.maxLength;
    const maxLength = parseInt(maxLengthString, 10);

    const result: any = {};
    if (!isNaN(minLength)) {
        result.minLength = minLength;
    }
    if (!isNaN(maxLength)) {
        result.maxLength = maxLength;
    }
    return result;
}

function fixValueDomain(cde) {
    const cdeObj = cde.toObject();
    const valueDomain = cdeObj.valueDomain;
    if (valueDomain === 'Text' && !isEmpty(valueDomain.datatypeText)) {
        cde.valueDomain.datatypeText = fixDatatypeText(valueDomain.datatypeText);
    }
    if (valueDomain === 'Number' && !isEmpty(valueDomain.datatypeNumber)) {
        cde.valueDomain.datatypeNumber = fixDatatypeNumber(valueDomain.datatypeNumber);
    }
    if (valueDomain === 'Date' && !isEmpty(valueDomain.datatypeDate)) {
        cde.valueDomain.datatypeDate = fixDatatypeDate(valueDomain.datatypeDate);
    }
    if (valueDomain === 'Time' && !isEmpty(valueDomain.datatypeTime)) {
        cde.valueDomain.datatypeTime = fixDatatypeTime(valueDomain.datatypeTime);
    }
    if (valueDomain === 'Dynamic Code List' && !isEmpty(valueDomain.datatypeDynamicCodeList)) {
        cde.valueDomain.datatypeDynamicCodeList = fixDatatypeDynamicCodeList(valueDomain.datatypeDynamicCodeList);
    }
    if (valueDomain === 'Value List' && !isEmpty(valueDomain.datatypeValueList)) {
        cde.valueDomain.datatypeValueList = fixDatatypeValueList(valueDomain.datatypeValueList);
    }
    if (valueDomain === 'Externally Defined' && !isEmpty(valueDomain.datatypeExternallyDefined)) {
        cde.valueDomain.datatypeExternallyDefined = fixDatatypeExternallyDefined(valueDomain.datatypeExternallyDefined);
    }
}


(() => {
    let cdeCount = 0;
    const cursor = dataElementModel.find({
        'registrationState.registrationStatus': {$ne: 'Retired'},
        archived: false
    }).cursor();
    cursor.eachAsync(async (cde: any) => {
        fixValueDomain(cde);
        await cde.save().catch(error => {
            throw new Error(`${cde.tinyId} ${error}`);
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
