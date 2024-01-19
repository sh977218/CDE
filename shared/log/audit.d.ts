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

export interface ServerErrorResponse {
    logs: ServerError[];
    totalItems: number;
}

export interface ServerError {
    message: string;
    origin: string;
    stack: string;
    details: string;
    date: string;
}

export interface ClientErrorResponse {
    logs: ClientError[];
    totalItems: number;
}

export interface ClientError {
    date?: string;
    message: string;
    url: string;
    userAgent?: string;
    username?: string;
    ip?: string;
}

export interface ClientErrorExtraInfo {
    stack: string;
    url: string;
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
