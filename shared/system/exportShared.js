import { capString } from 'shared/system/util';

export const exportHeader = {
    cdeHeader: "Name, Question Texts, Other Names, Value Domain, Permissible Values, Identifiers, Steward, Registration Status, Administrative Status, Used By\n",
    redCapHeader: 'Variable / Field Name,Form Name,Section Header,Field Type,Field Label,"Choices, Calculations, OR Slider Labels",Field Note,Text Validation Type OR Show Slider Number,Text Validation Min,Text Validation Max,Identifier?,Branching Logic (Show field only if...),Required Field?,Custom Alignment,Question Number (surveys only),Matrix Group Name,Matrix Ranking?,Field Annotation\n'
};

export function stripBsonIds(elt) {
    delete elt._id;
    delete elt.updated;
    delete elt.history;
    if (elt.updatedBy) delete elt.updatedBy.userId;
    return elt;
}
