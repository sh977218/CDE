import { findAnyOne, initTrafficFilter } from 'server/system/trafficFilterDb';

export async function getTrafficFilter() {
    const foundOne = await findAnyOne();
    if (foundOne) {
        return foundOne;
    } else {
        const newOne = await initTrafficFilter();
        return newOne;
    }
}

export function getRealIp(request) {
    if (request._remoteAddress) {
        return request._remoteAddress;
    }
    if (request.ip) {
        return request.ip;
    }
}

export async function banIp(ip, reason) {
    const foundOne = await findAnyOne();

    const foundIndex = foundOne.ipList.findIndex(r => r.ip === ip);
    if (foundIndex !== -1) {
        foundOne.ipList[foundIndex].strikes++;
        foundOne.ipList[foundIndex].reason = reason;
        foundOne.ipList[foundIndex].date = Date.now();
    } else {
        foundOne.ipList.push({ip: reason});
    }
}
