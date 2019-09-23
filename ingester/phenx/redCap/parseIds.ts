import { isEmpty } from 'lodash';
import { leadingZerosProtocolId } from 'ingester/phenx/Form/ParseAttachments';

export function parseIds(row, newForm) {
    const ids: any[] = [];
    const variableName = row['Variable / Field Name'];
    const leadingZeroFormId = leadingZerosProtocolId(newForm.ids[0].id);
    if (!isEmpty(variableName)) {
        ids.push({
            source: 'PhenX Variable',
            id: leadingZeroFormId + '_' + variableName.trim()
        });
    }

    return ids;
}
