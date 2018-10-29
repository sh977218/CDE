const capitalize = require('capitalize');
const BranchLogic = require('./BranchLogic');

exports.convert = async (redCapCde, redCapCdes, cde) => {
    let fieldLabel = redCapCde['Field Label'].trim();
    let variableName = redCapCde['Variable / Field Name'];
    let required = redCapCde['Required Field?'] ? redCapCde['Required Field?'] : false;
    let permissibleValues = cde.valueDomain.permissibleValues ? cde.valueDomain.permissibleValues : [];
    let branchLogic = redCapCde['Branching Logic (Show field only if...)'];
    let skipLogicCondition = '';
    if (branchLogic && branchLogic.trim().length > 0) {
        skipLogicCondition = BranchLogic.convertSkipLogic(branchLogic, redCapCdes);
    }

    let question = {
        elementType: "question",
        label: fieldLabel,
        hideLabel: fieldLabel.length === 0 ? true : false,
        cardinality: {min: 1, max: 1},
        skipLogic: {
            condition: skipLogicCondition
        },
        question: {
            cde: {
                tinyId: cde.tinyId,
                version: cde.version,
                derivationRules: cde.derivationRules,
                name: fieldLabel.length === 0 ? capitalize.words(variableName.replace(/_/g, ' ')) : fieldLabel,
                ids: cde.ids ? cde.ids : [],
                permissibleValues: permissibleValues
            },
            datatype: cde.valueDomain.datatype,
            required: required,
            unitsOfMeasure: cde.valueDomain.uom ? [{system: '', code: cde.valueDomain.uom}] : [],
            answers: permissibleValues
        }
    };
    if (question.question.datatype === 'Number') {
        question.question.datatypeNumber = cde.valueDomain.datatypeNumber ? cde.valueDomain.datatypeNumber : {};
    } else if (question.question.datatype === 'Text') {
        question.question.datatypeText = cde.valueDomain.datatypeText ? cde.valueDomain.datatypeText : {};
        var validationType = data['Text Validation Type OR Show Slider Number'];
        if (validationType.trim() === 'notes')
            question.question.datatypeText.showAsTextArea = true;
    } else if (question.question.datatype === 'Date') {
        question.question.datatypeDate = cde.valueDomain.datatypeDate ? cde.valueDomain.datatypeDate : {};
    } else if (question.question.datatype === 'Value List') {
        if (cde.valueDomain.permissibleValues.length === 0) {
            console.log(data);
            console.log('id ' + cde.ids[0].id);
            throw ('Unknown CDE datatype: ' + cde.valueDomain.datatype);
        }
        cde.valueDomain.permissibleValues.forEach(function (pv) {
            if (!pv.valueMeaningName || pv.valueMeaningName.trim().length === 0) {
                pv.valueMeaningName = pv.permissibleValue;
            }
            question.question.answers.push(pv);
            question.question.cde.permissibleValues.push(pv);
        });
    }
    return question;
};