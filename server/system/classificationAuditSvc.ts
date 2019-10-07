import { classificationAuditPagination } from 'server/system/classificationAuditDb';

export async function getClassificationAuditLog(params) {
    const sort = '-date';
    const skip = params.skip;
    const limit = params.limit;
    const records = await classificationAuditPagination({sort, skip, limit});
    return records;
}