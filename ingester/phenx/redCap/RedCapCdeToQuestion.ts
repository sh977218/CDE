import { words } from 'capitalize';
import { convertSkipLogic } from './BranchLogic';
import { map as REDCAP_MULTISELECT_MAP } from 'ingester/phenx/redCap/REDCAP_MULTISELECT_MAP';
import { BATCHLOADER } from 'ingester/shared/utility';

export async function convert(redCapCde, redCapCdes, cde, newForm) {
    if (cde.toObject) {
        cde = cde.toObject();
    }
    const fieldType = redCapCde['Field Type'];
    const validationType = redCapCde['Text Validation Type OR Show Slider Number'];
    const choicesCalculationsORSliderLabels = redCapCde['Choices, Calculations, OR Slider Labels'];
    const fieldLabel = redCapCde['Field Label'].trim();
    const variableName = redCapCde['Variable / Field Name'];
    const required = redCapCde['Required Field?'] ? redCapCde['Required Field?'] : false;
    const multiselect = REDCAP_MULTISELECT_MAP[fieldType];
    const branchLogic = redCapCde['Branching Logic (Show field only if...)'];
    let skipLogicCondition = '';
    if (branchLogic && branchLogic.trim().length > 0) {
        if (branchLogic.indexOf('(') === -1) {
            skipLogicCondition = convertSkipLogic(branchLogic, redCapCdes);
        } else {
            const newFormId = newForm.ids[0].id;
            const commentText = `${newFormId} PhenX loader was not able to create Skip Logic rule on Question ${fieldLabel}. Rules: ${branchLogic}`;
            const skipLogicComment = {
                text: commentText,
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
        const scoreComment = {
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
    const questionFormElement: any = {
        elementType: 'question',
        label: fieldLabel,
        cardinality: {min: 1, max: 1},
        skipLogic: {
            condition: skipLogicCondition
        },
        question: {
            cde: {
                tinyId: cde.tinyId,
                derivationRules: cde.derivationRules,
                name: fieldLabel.length === 0 ? words(variableName.replace(/_/g, ' ')) : fieldLabel,
                ids: cde.ids ? cde.ids : [],
                permissibleValues: cde.valueDomain.permissibleValues
            },
            datatype: cde.valueDomain.datatype,
            required,
            multiselect,
            unitsOfMeasure: cde.valueDomain.uom ? [{system: '', code: cde.valueDomain.uom}] : [],
            answers: cde.valueDomain.permissibleValues
        }
    };
    if (cde.version) {
        questionFormElement.question.cde.version = cde.version;
    }
    if (validationType.trim() === 'notes') {
        questionFormElement.question.datatypeText.showAsTextArea = true;
    }
    return questionFormElement;
}
