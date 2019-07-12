import { isEmpty } from 'lodash';
import { DataElement } from '../server/cde/mongo-cde';

process.on('unhandledRejection', function (error) {
    console.log(error);
});

class ValueDomain {
    uom: string;
    vsacOid: string;

    // those are for NCI source, they should move to sources
    name: string;
    identifiers: [any];
    ids: [any];
    definition: string;

    constructor(valueDomain) {
        if (valueDomain.uom) {
            this.uom = valueDomain.uom
        }
        if (valueDomain.vsacOid) {
            this.vsacOid = valueDomain.vsacOid
        }
        if (valueDomain.name) {
            this.name = valueDomain.name
        }
        if (valueDomain.identifiers) {
            this.identifiers = valueDomain.identifiers
        }
        if (valueDomain.ids) {
            this.ids = valueDomain.ids
        }
        if (valueDomain.definition) {
            this.definition = valueDomain.definition
        }
    }
}

class DataTypeText {
    minLength: number;
    maxLength: number;

    constructor(dataTypeText) {
        if (dataTypeText.minLength) {
            let minLengthString = dataTypeText.minLength + '';
            this.minLength = parseInt(minLengthString);
        }
        if (dataTypeText.maxLength) {
            let maxLengthString = dataTypeText.maxLength;
            this.maxLength = parseInt(maxLengthString);
        }
    }
}

class DataTypeNumber {
    minValue: number;
    maxValue: number;
    precision: number;

    constructor(dataTypeNumber) {
        if (dataTypeNumber.minValue) {
            let minValueString = dataTypeNumber.minValue + '';
            this.minValue = parseInt(minValueString);
        }
        if (dataTypeNumber.maxValue) {
            let maxValueString = dataTypeNumber.maxValue;
            this.maxValue = parseInt(maxValueString);
        }
        if (dataTypeNumber.precision) {
            let precisionString = dataTypeNumber.precision;
            this.precision = parseInt(precisionString);
        }
    }
}

class DataTypeDate {
    precision: string;

    constructor(dataTypeDate) {
        if (dataTypeDate.precision) {
            this.precision = dataTypeDate.precision + '';
        }
    }
}

class DataTypeTime {
    format: string;

    constructor(dataTypeTime) {
        if (dataTypeTime.format) {
            this.format = dataTypeTime.format + '';
        }
    }
}

class DataTypeDynamicCodeList {
    system: string;
    code: string;

    constructor(dataTypeDynamicCodeList) {
        if (dataTypeDynamicCodeList.system) {
            this.system = dataTypeDynamicCodeList.system + '';
        }
        if (dataTypeDynamicCodeList.code) {
            this.code = dataTypeDynamicCodeList.code + '';
        }
    }
}



class ValueDomainText extends ValueDomain {
    datatype: string = 'Text';
    datatypeText?: DataTypeText;

    constructor(valueDomain) {
        super(valueDomain);
        if (!isEmpty(valueDomain.datatypeText)) {
            this.datatypeText = new DataTypeText(valueDomain.datatypeText);
        }
    }
}

class ValueDomainNumber extends ValueDomain {
    datatype: string = 'Number';
    datatypeNumber?: DataTypeNumber;

    constructor(valueDomain) {
        super(valueDomain);
        if (!isEmpty(valueDomain.datatypeNumber)) {
            this.datatypeNumber = new DataTypeNumber(valueDomain.datatypeNumber);
        }
    }
}

class ValueDomainDate extends ValueDomain {
    datatype: string = 'Date';
    datatypeDate?: DataTypeDate;

    constructor(valueDomain) {
        super(valueDomain);
        if (!isEmpty(valueDomain.datatypeDate)) {
            this.datatypeDate = new DataTypeDate(valueDomain.datatypeText);
        }
    }
}

class ValueDomainTime extends ValueDomain {
    datatype: string = 'Date';
    dataTypeTime?: DataTypeTime;

    constructor(valueDomain) {
        super(valueDomain);
        if (!isEmpty(valueDomain.dataTypeTime)) {
            this.dataTypeTime = new DataTypeTime(valueDomain.dataTypeTime);
        }
    }
}

class ValueDomainDynamicCodeList extends ValueDomain {
    datatype: string = 'Dynamic Code List';
    datatypeDynamicCodeList?: DataTypeDynamicCodeList;

    constructor(valueDomain) {
        super(valueDomain);
        if (!isEmpty(valueDomain.datatypeDynamicCodeList)) {
            this.datatypeDynamicCodeList = new DataTypeDynamicCodeList(valueDomain.datatypeDynamicCodeList);
        }
    }
}






function fixValueDomain(cde) {
    let cdeObj = cde.toObject();
    let datatype = cdeObj.valueDomain.datatype;
    let valueDomain = cdeObj.valueDomain;
    if (datatype === 'Text') {
        cde.valueDomain = new ValueDomainText(valueDomain);
    } else if (datatype === 'Date') {
        cde.valueDomain = new ValueDomainDate(valueDomain);
    } else if (datatype === 'Number') {
        cde.valueDomain = new ValueDomainNumber(valueDomain);
    } else if (datatype === 'Time') {
        cde.valueDomain = new ValueDomainTime(valueDomain);
    } else if (datatype === 'Dynamic Code List') {
        cde.valueDomain = new ValueDomainDynamicCodeList(valueDomain);
    }else if (datatype === 'Dynamic Code List') {
        cde.valueDomain = new ValueDomainDynamicCodeList(valueDomain);
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

function fixError(error, cde) {
    error.errors.forEach(e => {
        if (e.dataPath.indexOf('.valueDomain.permissibleValues') !== -1) {
            if (e.message === 'should NOT be shorter than 1 characters') {
                fixEmptyPermissibleValue(cde);
            }
            if (e.message === "should have required property 'permissibleValue'") {
                fixEmptyPermissibleValue(cde);
            }
        } else if (e.dataPath.indexOf('.createdBy') !== -1) {
            if (e.message === "should have required property 'username'") {
                fixCreatedBy(cde);
            }
        } else if (e.message === "should have required property 'created'") {
            fixCreated(cde);
        } else if (e.dataPath.indexOf('.designations[') !== -1) {
            if (e.message === "should have required property 'designation'") {
                fixEmptyDesignation(cde);
            }
        } else if (e.dataPath.indexOf('.sources[') !== -1) {
            if (e.message === "should have required property 'sourceName'") {
                fixSourceName(cde);
            }
        } else {
            console.log('other error.');
            process.exit(1);
        }
    });
}

(function () {
    let cdeCount = 0;
    DataElement.find({
        lastMigrationScript: {$ne: 'fixDataElement'},
        archived: false,
        'registrationState.registrationStatus': {$ne: "Retired"}
    }).cursor().eachAsync(async (cde: any) => {
        cde.lastMigrationScript = 'fixDataElement';
        fixValueDomain(cde);
        await cde.save().catch(error => {
            fixError(error, cde);
            cde.save().catch(error2 => {
                throw `${cde.tinyId} ${error2}`;
            });
        });
        cdeCount++;
        console.log(`cdeCount: ${cdeCount}`);
    }).then(e => {
        if (e) throw e;
        else {
            console.log('finished.');
            process.exit(0);
        }

    });
})();