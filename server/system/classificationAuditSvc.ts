import { dbPlugins } from 'server';
import { classificationAuditPagination, saveClassificationAudit } from 'server/system/classificationAuditDb';
import { ClassificationAudit } from 'shared/audit/classificationAudit';
import { getModule, getName } from 'shared/elt/elt';
import { Item } from 'shared/models.model';

export async function getClassificationAuditLog(params: {limit: number, skip: number}) {
    const sort = '-date';
    const skip = params.skip;
    const limit = params.limit;
    return await classificationAuditPagination({sort, skip, limit});
}
export function addToClassifAudit(msg: ClassificationAudit) {
    const persistClassifRecord = (elt: Item | null) => {
        if (!elt) {
            return;
        }
        msg.elements[0].eltType = getModule(elt);
        msg.elements[0].name = getName(elt);
        msg.elements[0].status = elt.registrationState.registrationStatus;
        saveClassificationAudit(msg);
    };
    [dbPlugins.dataElement, dbPlugins.form].forEach((dao) => {
        if (msg.elements[0]) {
            if (msg.elements[0]._id && dao.byId) {
                dao.byId(msg.elements[0]._id)
                    .then(persistClassifRecord);
            }
            if (msg.elements[0].tinyId && dao.byTinyId) {
                dao.byTinyId(msg.elements[0].tinyId)
                    .then(persistClassifRecord);
            }
        }
    });
}
