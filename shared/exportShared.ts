import { ClassificationElement, Elt } from 'shared/models.model';

export const exportHeader: {
    cdeHeader: string;
    redCapHeader: string;
} = {
    /* tslint:disable */
    cdeHeader:
        'Name, Question Texts, Other Names, Value Domain, Permissible Values, Identifiers, Steward, Registration Status, Administrative Status, Used By\n',
    redCapHeader:
        'Variable / Field Name,Form Name,Section Header,Field Type,Field Label,"Choices, Calculations, OR Slider Labels",Field Note,Text Validation Type OR Show Slider Number,Text Validation Min,Text Validation Max,Identifier?,Branching Logic (Show field only if...),Required Field?,Custom Alignment,Question Number (surveys only),Matrix Group Name,Matrix Ranking?,Field Annotation\n',
    /* tslint:enable */
};

export function stripBsonIds<T>(t: T): T {
    delete (t as any)._id;
    return t;
}

export function stripBsonIdsElt<T extends Elt>(elt: T): T {
    delete elt._id;

    function classificationDeleteId(elements: ClassificationElement[]) {
        elements.forEach(e => {
            delete (e as any)._id;
            if (e.elements) {
                classificationDeleteId(e.elements);
            }
        });
    }

    elt.classification.forEach(c => {
        if (c.elements) {
            classificationDeleteId(c.elements);
        }
    });
    elt.history = [];
    delete elt.updated;
    return elt;
}
