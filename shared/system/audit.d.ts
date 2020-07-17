export interface AuditLog {
    currentPage: number;
    ipAddress: string;
    totalItems: number;
    fromDate: number;
    toDate: number;
    sort: {date: string};
}

export interface AuditLogResponse {
    logs: LogMessage[];
    sort: {date: string};
    totalItems?: number;
}

export interface LogMessage {
    date: number;
    remoteAddr: string;
    level: string;
    url: string;
    method: string;
    httpStatus: string;
    referrer: string;
}
