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
