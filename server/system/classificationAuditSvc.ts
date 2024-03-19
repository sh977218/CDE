import { dbPlugins } from 'server';
import { saveClassificationAudit } from 'server/system/classificationAuditDb';
import { getModule, getName } from 'shared/elt/elt';
import { ClassificationAuditLog } from 'shared/log/audit';
import { Item } from 'shared/models.model';

export function addToClassifAudit(msg: ClassificationAuditLog) {
    const persistClassifRecord = (elt: Item | null) => {
        if (!elt) {
            return;
        }
        msg.elements[0].eltType = getModule(elt);
        msg.elements[0].name = getName(elt);
        msg.elements[0].status = elt.registrationState.registrationStatus;
        saveClassificationAudit(msg);
    };
    [dbPlugins.dataElement, dbPlugins.form].forEach(dao => {
        if (msg.elements[0]) {
            if (msg.elements[0]._id && dao.byId) {
                dao.byId(msg.elements[0]._id).then(persistClassifRecord);
            }
            if (msg.elements[0].tinyId && dao.byTinyId) {
                dao.byTinyId(msg.elements[0].tinyId).then(persistClassifRecord);
            }
        }
    });
}
