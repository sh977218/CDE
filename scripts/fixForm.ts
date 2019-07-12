import { Form } from '../server/form/mongo-form';

process.on('unhandledRejection', function (error) {
    console.log(error);
});

function fixCreatedBy(cde) {
    cde.createdBy = {
        username: 'nobody'
    };
}

function fixError(error, form) {
    error.errors.forEach(e => {
        if (e.dataPath.indexOf('.createdBy') !== -1) {
            if (e.message === "should have required property 'username'") {
                fixCreatedBy(form);
            }
        } else {
            console.log('other error.');
        }
    });
}

(function () {
    let formCount = 0;
    Form.find({
        lastMigrationScript: {$ne: 'fixDataElement'},
        archived: false,
        'registrationState.registrationStatus': {$ne: "Retired"}
    }).cursor().eachAsync(async (form: any) => {
        form.lastMigrationScript = 'fixDataElement';
        await form.save().catch(error => {
            fixError(error, form);
            form.save().catch(error2 => {
                throw `${form.tinyId} ${error2}`;
            });
        });
        formCount++;
        console.log(`formCount: ${formCount}`);
    }).then(e => {
        console.log(e);
    });
})();