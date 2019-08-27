import { words } from 'capitalize';
import { convertSkipLogic } from './BranchLogic';
import { map as REDCAP_MULTISELECT_MAP } from 'ingester/phenx/redCap/REDCAP_MULTISELECT_MAP';
import { BATCHLOADER } from 'ingester/shared/utility';

export async function convert(redCapCde, redCapCdes, cde, newForm) {
    if (cde.toObject) cde = cde.toObject();
    let fieldType = redCapCde['Field Type'];
    let validationType = redCapCde['Text Validation Type OR Show Slider Number'];
    let choicesCalculationsORSliderLabels = redCapCde['Choices, Calculations, OR Slider Labels'];
    let fieldLabel = redCapCde['Field Label'].trim();
    let variableName = redCapCde['Variable / Field Name'];
    let required = redCapCde['Required Field?'] ? redCapCde['Required Field?'] : false;
    let multiselect = REDCAP_MULTISELECT_MAP[fieldType];
    let branchLogic = redCapCde['Branching Logic (Show field only if...)'];
    let skipLogicCondition = '';
    if (branchLogic && branchLogic.trim().length > 0) {
        if (branchLogic.indexOf('(') === -1)
            skipLogicCondition = convertSkipLogic(branchLogic, redCapCdes);
        else {
            let skipLogicComment = {
                text: newForm.ids[0].id + ' PhenX Batch loader was not able to create Skip Logic rule on Question ' + fieldLabel + '. Rules: ' + branchLogic,
                user: BATCHLOADER,
                created: new Date(),
                pendingApproval: false,
                linkedTab: 'description',
                status: 'active',
                replies: [],
                element: {
                    eltType: 'form'
                }
            };
            newForm.comments.push(skipLogicComment);
        }
    }
    if (fieldType && fieldType.trim() === 'calc') {
        let scoreComment = {
            text: 'PhenX Score Calculation was not parsed ' + fieldLabel + '. Formula: ' + choicesCalculationsORSliderLabels,
            user: BATCHLOADER,
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
        newForm.comments.push(scoreComment);
    }
    let question: any = {
        elementType: "question",
        label: fieldLabel,
        cardinality: {min: 1, max: 1},
        skipLogic: {
            condition: skipLogicCondition
        },
        question: {
            cde: {
                tinyId: cde.tinyId,
                version: cde.version,
                designations: cde.designations,
                derivationRules: cde.derivationRules,
                name: fieldLabel.length === 0 ? words(variableName.replace(/_/g, ' ')) : fieldLabel,
                ids: cde.ids ? cde.ids : [],
                permissibleValues: cde.valueDomain.permissibleValues
            },
            datatype: cde.valueDomain.datatype,
            required: required,
            multiselect: multiselect,
            unitsOfMeasure: cde.valueDomain.uom ? [{system: '', code: cde.valueDomain.uom}] : [],
            answers: cde.valueDomain.permissibleValues
        }
    };
    if (validationType.trim() === 'notes')
        question.question.datatypeText.showAsTextArea = true;
    return question;
}