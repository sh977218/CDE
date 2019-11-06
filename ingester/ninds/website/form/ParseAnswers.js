exports.parseAnswers = ninds => {
    if (!ninds['Permissible Value'] || !ninds['Description'])
        return [];
    let answers = [];
    let pvsArray = ninds['Permissible Value'].split(';');
    let isPvValueNumber = /^\d+$/.test(pvsArray[0]);
    let pdsArray = ninds['Description'].split(';');
    if (pvsArray.length !== pdsArray.length) {
        console.log('***permissibleValue and permissibleDescription do not match in ParseAnswer');
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