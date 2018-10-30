exports.parseAnswers = ninds => {
    let answers = [];
    let pvsArray = ninds.permissibleValue.split(';');
    let isPvValueNumber = /^\d+$/.test(pvsArray[0]);
    let pdsArray = ninds.permissibleDescription.split(';');
    if (pvsArray.length !== pdsArray.length) {
        console.log('***permissibleValue and permissibleDescription do not match.');
        console.log('***cde:' + ninds.cdeId);
        process.exit(1);
    }
    for (let i = 0; i < pvsArray.length; i++) {
        if (pvsArray[i].length > 0) {
            let pv = {
                permissibleValue: pvsArray[i],
                valueMeaningDefinition: pdsArray[i]
            };
            if (isPvValueNumber) {
                pv.valueMeaningName = pdsArray[i];
            } else {
                pv.valueMeaningName = pvsArray[i];
            }
            answers.push(pv);
        }
    }
    return answers;
};