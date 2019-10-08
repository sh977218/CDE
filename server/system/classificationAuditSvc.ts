import { classificationAuditPagination, saveClassificationAudit } from 'server/system/classificationAuditDb';
import { getDaoList } from 'server/system/moduleDaoManager';
import { getModule, getName } from 'shared/elt';

export async function getClassificationAuditLog(params) {
    const sort = '-date';
    const skip = params.skip;
    const limit = params.limit;
    const records = await classificationAuditPagination({sort, skip, limit});
    return records;
}
export function addToClassifAudit(msg) {
    const persistClassifRecord = (err, elt) => {
        if (!elt) {
            return;
        }
        msg.elements[0].eltType = getModule(elt);
        msg.elements[0].name = getName(elt);
        msg.elements[0].status = elt.registrationState.registrationStatus;
        saveClassificationAudit(msg);
    };
    getDaoList().forEach((dao) => {
        if (msg.elements[0]) {
            if (msg.elements[0]._id && dao.byId) {
                dao.byId(msg.elements[0]._id, persistClassifRecord);
            }
            if (msg.elements[0].tinyId && dao.eltByTinyId) {
                dao.eltByTinyId(msg.elements[0].tinyId, persistClassifRecord);
            }
        }
    });
}
