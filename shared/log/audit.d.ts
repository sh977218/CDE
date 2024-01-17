export type SortOrder = -1 | 1 | 'asc' | 'ascending' | 'desc' | 'descending';

export interface HttpLogResponse {
    logs: HttpLog[];
    totalItems: number;
}

export interface HttpLog {
    _id: string;
    date: string;
    httpStatus: string;
    level: string;
    method: string;
    referrer: string;
    remoteAddr: string;
    responseTime: string;
    url: string;
}

export interface AppLogResponse {
    logs: AppLog[];
    totalItems: number;
}

export interface AppLog {
    date: number;
    message: string;
    level: 'debug' | 'info' | 'warning' | 'error';
}

export interface DailyUsage {
    _id: { ip: string, year: number, month: number, day: number };
    latest: string;
    hits: number
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
