import { classificationAuditPagination, saveClassificationAudit } from 'server/system/classificationAuditDb';
import { getItemDaoList } from 'server/system/itemDaoManager';
import { ClassificationAudit } from 'shared/audit/classificationAudit';
import { getModule, getName } from 'shared/elt';
import { Item } from 'shared/models.model';

export async function getClassificationAuditLog(params: {limit: number, skip: number}) {
    const sort = '-date';
    const skip = params.skip;
    const limit = params.limit;
    return await classificationAuditPagination({sort, skip, limit});
}
export function addToClassifAudit(msg: ClassificationAudit) {
    const persistClassifRecord = (err: Error | null, elt: Item | null) => {
        if (!elt) {
            return;
        }
        msg.elements[0].eltType = getModule(elt);
        msg.elements[0].name = getName(elt);
        msg.elements[0].status = elt.registrationState.registrationStatus;
        saveClassificationAudit(msg);
    };
    getItemDaoList().forEach((dao) => {
        if (msg.elements[0]) {
            if (msg.elements[0]._id && dao.byId) {
                dao.byId(msg.elements[0]._id, persistClassifRecord);
            }
            if (msg.elements[0].tinyId && dao.byTinyId) {
                dao.byTinyId(msg.elements[0].tinyId, persistClassifRecord);
            }
        }
    });
}
