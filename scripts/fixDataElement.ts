import { DataElement } from '../server/cde/mongo-cde';

process.on('unhandledRejection', function (error) {
    console.log(error);
});

// @TODO m1bcp9pLDI does not have sourceName
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

function fixDatatypeText(cde) {
    let cdeObj = cde.toObject();
    let minLengthString = cdeObj.valueDomain.datatypeText.minLength;
    let minLength = parseInt(minLengthString);
    let maxLengthString = cdeObj.valueDomain.datatypeText.maxLength;
    let maxLength = parseInt(maxLengthString);
    cde.valueDomain.datatypeText = {minLength, maxLength};
}

function fixCreated(cde) {
    let defaultDate = new Date();
    defaultDate.setFullYear(1970, 1, 1);
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
        } else if (e.dataPath === '.valueDomain.datatypeText.minLength') {
            if (e.message === "should be number") {
                fixDatatypeText(cde);
            }
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