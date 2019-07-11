import { DataElement } from '../server/cde/mongo-cde';

process.on('unhandledRejection', function (error) {
    console.log(error);
});

function fixEmptyPermissibleValue(cde) {
    let cdeObj = cde.toObject();
    cdeObj.valueDomain.permissibleValues.forEach(pv => {
        if (!pv.permissibleValue) pv.permissibleValue = pv.valueMeaningName;
    });
    cde.valueDomain.permissibleValues = cdeObj.valueDomain.permissibleValues.filter(pv => !pv.permissibleValue);
    console.log('fixed.');
}

function fixError(error, cde) {
    error.errors.forEach(e => {
        if (e.dataPath.indexOf('.valueDomain.permissibleValues') !== -1) {
            if (e.message === 'should NOT be shorter than 1 characters') {
                fixEmptyPermissibleValue(cde);
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
            })
        });
        cdeCount++;
        console.log(`cdeCount: ${cdeCount}`);
    }).then(e => {
        if (e) throw e;
        else {
            console.log('finished.');
            process.exit(0);
        }

    })
})();