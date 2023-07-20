export type SortOrder = -1 | 1 | 'asc' | 'ascending' | 'desc' | 'descending';

export interface AuditLog {
    currentPage: number;
    ipAddress: string;
    totalItems: number;
    fromDate: number;
    toDate: number;
    sort: {date: SortOrder};
}

export interface AuditLogResponse {
    logs: LogMessage[];
    sort: {date: SortOrder};
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

export interface LoginRecord {
    date: Date,
    user: string,
    email?: string,
    ip: string,
}
