export interface TrafficFilter {
    ipList: {
        ip: string,
        date: number,
        reason: string,
        strikes: number
    }[];
}
