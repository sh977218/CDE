import { isEmpty } from 'lodash';
import { DataElement } from '../server/cde/mongo-cde';

process.on('unhandledRejection', function (error) {
    console.log(error);
});

function fixDatatypeExternallyDefined(datatypeExternallyDefined) {
    let linkString = datatypeExternallyDefined.link + '';
    let link = linkString.trim();

    let descriptionString = datatypeExternallyDefined.description + '';
    let description = descriptionString.trim();

    let descriptionFormatString = datatypeExternallyDefined.descriptionFormat + '';
    let descriptionFormat = descriptionFormatString.trim();

    let result: any = {};
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
    let datatypeString = datatypeValueList.datatype + '';
    let datatype = datatypeString.trim();

    let result: any = {};
    if (datatype) {
        result.datatype = datatype;
    }
    return result;
}

function fixDatatypeDynamicCodeList(datatypeDynamicCodeList) {
    let systemString = datatypeDynamicCodeList.system + '';
    let system = systemString.trim();

    let codeString = datatypeDynamicCodeList.code + '';
    let code = codeString.trim();

    let result: any = {};
    if (system) {
        result.system = system;
    }
    if (code) {
        result.code = code;
    }
    return result;
}

function fixDatatypeTime(datatypeTime) {
    let formatString = datatypeTime.format + '';
    let format = formatString.trim();

    let result: any = {};
    if (format) {
        result.format = format;
    }
    return result;
}

function fixDatatypeDate(datatypeDate) {
    let precisionString = datatypeDate.precision + '';
    let precision = precisionString.trim();

    let result: any = {};
    if (precision) {
        result.precision = precision;
    }
    return result;
}

function fixDatatypeNumber(datatypeNumber) {
    let minValueString = datatypeNumber.minValue;
    let minValue = parseInt(minValueString);

    let maxValueString = datatypeNumber.maxValue;
    let maxValue = parseInt(maxValueString);

    let result: any = {};
    if (!isNaN(minValue)) {
        result.minValue = minValue;
    }
    if (!isNaN(maxValue)) {
        result.maxValue = maxValue;
    }
    return result;
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

function fixValueDomain(cde) {
    let cdeObj = cde.toObject();
    let valueDomain = cdeObj.valueDomain;
    if (valueDomain === 'Text' && !isEmpty(valueDomain.datatypeText)) {
        cde.valueDomain.datatypeText = fixDatatypeText(valueDomain.datatypeText)
    }
    if (valueDomain === 'Number' && !isEmpty(valueDomain.datatypeNumber)) {
        cde.valueDomain.datatypeNumber = fixDatatypeNumber(valueDomain.datatypeNumber)
    }
    if (valueDomain === 'Date' && !isEmpty(valueDomain.datatypeDate)) {
        cde.valueDomain.datatypeDate = fixDatatypeDate(valueDomain.datatypeDate)
    }
    if (valueDomain === 'Time' && !isEmpty(valueDomain.datatypeTime)) {
        cde.valueDomain.datatypeTime = fixDatatypeTime(valueDomain.datatypeTime)
    }
    if (valueDomain === 'Dynamic Code List' && !isEmpty(valueDomain.datatypeDynamicCodeList)) {
        cde.valueDomain.datatypeDynamicCodeList = fixDatatypeDynamicCodeList(valueDomain.datatypeDynamicCodeList)
    }
    if (valueDomain === 'Value List' && !isEmpty(valueDomain.datatypeValueList)) {
        cde.valueDomain.datatypeValueList = fixDatatypeValueList(valueDomain.datatypeValueList)
    }
    if (valueDomain === 'Externally Defined' && !isEmpty(valueDomain.datatypeExternallyDefined)) {
        cde.valueDomain.datatypeExternallyDefined = fixDatatypeExternallyDefined(valueDomain.datatypeExternallyDefined)
    }
}


(function () {
    let cdeCount = 0;
    let cursor = DataElement.find({
        'registrationState.registrationStatus': {$ne: "Retired"},
        archived: false
    }).cursor();
    cursor.eachAsync(async (cde: any) => {
        fixValueDomain(cde);
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