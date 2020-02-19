import { findAnyOne, initTrafficFilter } from 'server/system/trafficFilterDb';
import { config } from 'server/system/parseConfig';

export let bannedIps: string[] = [];
const banEndsWith: string[] = config.banEndsWith || [];
const banStartsWith: string[] = config.banStartsWith || [];
const banContains: string[] = config.banContains || [];

const releaseHackersFrequency = 5 * 60 * 1000;
const keepHackerForDuration = 1000 * 60 * 60 * 24;

// every 30sec, get latest list.
setInterval(async () => {
    const foundOne = await getTrafficFilter();
    // release IPs, but keep track for a day
    foundOne.ipList = foundOne.ipList.filter(ipElt => ((Date.now() - ipElt.date) < (keepHackerForDuration * ipElt.strikes)));
    foundOne.save();
    bannedIps = foundOne.ipList.filter(ipElt => ((Date.now() - ipElt.date) < releaseHackersFrequency * ipElt.strikes)).map(r => r.ip);
}, 30 * 1000);


function addBan(req) {
    const ip = getRealIp(req);
    banIp(ip, req.originalUrl);
    bannedIps.push(ip);
}

export function banHackers(req, res, next) {
    let banHim = false;
    banEndsWith.forEach(ban => {
        if (req.originalUrl.slice(-(ban.length)) === ban) {
            addBan(req);
            banHim = true;
        }
    });
    banStartsWith.forEach(ban => {
        if (req.originalUrl.substr(0, ban.length) === ban) {
            addBan(req);
            banHim = true;
        }
    });

    banContains.forEach(ban => {
       if (req.originalUrl.toLowerCase().indexOf(ban) > -1) {
           addBan(req);
           banHim = true;
       }
    });

    if (banHim) {
        res.status(403).send();
    } else {
        next();
    }
}

export function blockBannedIps(req, res, next) {
    if (bannedIps.indexOf(getRealIp(req)) !== -1) {
        res.status(403).send('Access is temporarily disabled. If you think you received this response in error, please contact' +
            ' support. Otherwise, please try again in an hour.');
    } else {
        next();
    }
}

export async function getTrafficFilter() {
    let foundOne = await findAnyOne();
    if (!foundOne) {
        foundOne = await initTrafficFilter();
    }
    return foundOne;
}

export function getRealIp(request) {
    if (request._remoteAddress) {
        return request._remoteAddress;
    }
    if (request.ip) {
        return request.ip;
    }
}

export async function banIp(ip: string, reason: string) {
    const foundOne = await findAnyOne();

    const foundIndex = foundOne.ipList.findIndex(r => r.ip === ip);
    if (foundIndex !== -1) {
        foundOne.ipList[foundIndex].strikes++;
        foundOne.ipList[foundIndex].reason = reason;
        foundOne.ipList[foundIndex].date = Date.now();
    } else {
        foundOne.ipList.push({
            ip,
            reason
        });
    }

    await foundOne.save();
}
