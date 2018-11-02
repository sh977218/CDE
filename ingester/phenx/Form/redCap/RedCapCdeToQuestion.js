const capitalize = require('capitalize');
const BranchLogic = require('./BranchLogic');

const Comment = require('../../../../server/discuss/discussDb').Comment;

const REDCAP_MULTISELECT_MAP = require('./REDCAP_MULTISELECT_MAP').map

const batchloader = require('../../../shared/updatedByLoader').batchloader;


exports.convert = async (redCapCde, redCapCdes, cde, newForm) => {
    let fieldType = redCapCde['Field Type'];
    let choicesCalculationsORSliderLabels = redCapCde['Choices, Calculations, OR Slider Labels'];
    let fieldLabel = redCapCde['Field Label'].trim();
    let variableName = redCapCde['Variable / Field Name'];
    let required = redCapCde['Required Field?'] ? redCapCde['Required Field?'] : false;
    let multiselect = REDCAP_MULTISELECT_MAP[fieldType];
    let permissibleValues = cde.valueDomain.permissibleValues ? cde.valueDomain.permissibleValues : [];
    let branchLogic = redCapCde['Branching Logic (Show field only if...)'];
    let skipLogicCondition = '';
    if (branchLogic && branchLogic.trim().length > 0) {
        if (branchLogic.indexOf('(') === -1)
            skipLogicCondition = BranchLogic.convertSkipLogic(branchLogic, redCapCdes);
        else {
            let skipLogicComment = {
                text: 'Phenx Batch loader was not able to create Skip Logic rule on Question ' + fieldLabel + '. Rules: ' + branchLogic,
                user: batchloader,
                created: new Date(),
                pendingApproval: false,
                linkedTab: 'description',
                status: 'active',
                replies: [],
                element: {
                    eltType: 'form',
                    eltId: newForm.tinyId
                }
            };
            await new Comment(skipLogicComment).save();
        }
    }
    if (fieldType && fieldType.trim() === 'calc') {
        let scoreComment = {
            text: 'Phenx Score Calculation was not parsed ' + fieldLabel + '. Formula: ' + choicesCalculationsORSliderLabels,
            user: batchloader,
            created: new Date(),
            pendingApproval: false,
            linkedTab: 'description',
            status: 'active',
            replies: [],
            element: {
                eltType: 'form',
                eltId: newForm.tinyId
            }
        };
        await new Comment(scoreComment).save();
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
            multiselect: multiselect,
            unitsOfMeasure: cde.valueDomain.uom ? [{system: '', code: cde.valueDomain.uom}] : [],
            answers: permissibleValues
        }
    };
    if (question.question.datatype === 'Number') {
        question.question.datatypeNumber = cde.valueDomain.datatypeNumber ? cde.valueDomain.datatypeNumber : {};
    } else if (question.question.datatype === 'Text') {
        question.question.datatypeText = cde.valueDomain.datatypeText ? cde.valueDomain.datatypeText : {};
        let validationType = redCapCde['Text Validation Type OR Show Slider Number'];
        if (validationType.trim() === 'notes')
            question.question.datatypeText.showAsTextArea = true;
    } else if (question.question.datatype === 'Date') {
        question.question.datatypeDate = cde.valueDomain.datatypeDate ? cde.valueDomain.datatypeDate : {};
    } else if (question.question.datatype === 'Value List') {
        if (cde.valueDomain.permissibleValues.length === 0) {
            console.log();
            throw ('Unknown CDE ' + cde.ids[0].id + ' datatype: ' + +cde.valueDomain.datatype);
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