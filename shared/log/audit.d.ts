import { CurationStatus, DateType, EltLog, ModuleItem } from '../models.model';

export interface HttpLogResponse {
    logs: HttpLog[];
    totalItems: number;
}

export interface HttpLog {
    _id: string;
    date: Date;
    httpStatus: string;
    level: string;
    method: string;
    referrer: string;
    remoteAddr: string;
    responseTime: number;
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
    _id: { ip: string; year: number; month: number; day: number };
    latest: string;
    hits: number;
}

export type ActiveBanResponse = {
    ipList: ActiveBan[];
};

export type ActiveBan = {
    date: string;
    ip: string;
    strikes: number;
    reason: string;
};

export interface SearchParams {
    includeBatch: boolean;
    limit: number;
    skip: number;
}

export interface ItemLogResponse {
    logs: ItemLog[];
    totalItems: number;
}

export type ClassificationAuditLogElement = {
    _id?: string;
    tinyId?: string;
    version?: string;
    name?: string;
    status?: CurationStatus;
    eltType?: ModuleItem;
};

export type ClassificationAuditLog = {
    action: 'add' | 'delete' | 'rename' | 'reclassify';
    date: DateType;
    elements: ClassificationAuditLogElement[];
    newname?: string;
    path: string[];
    user: {
        username: string;
    };
};

export type ItemLog = EltLog | ClassificationAuditLog;

export interface ServerErrorResponse {
    logs: ServerError[];
    totalItems: number;
}

export interface ServerError {
    message: string;
    origin: string;
    stack: string;
    details?: string;
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

export interface LoginRecordResponse {
    logs: LoginRecord[];
    totalItems: number;
}

export interface LoginRecord {
    date: string;
    user: string;
    email?: string;
    ip: string;
}

/**
 * Search Request Types:
 */
type SearchRequestPagination = {
    currentPage: number;
    pageSize: number;
};
type SearchRequestSorting = {
    sortBy: string;
    sortDir: string;
};

type SearchRequestDateRange = {
    fromDate: Date;
    toDate: Date;
};

export type HttpLogSearchRequest = SearchRequestSorting &
    SearchRequestPagination &
    SearchRequestDateRange & { filterTerm: string };

export type AppLogSearchRequest = SearchRequestSorting & SearchRequestPagination & SearchRequestDateRange;

export type ItemLogSearchRequest = SearchRequestSorting &
    SearchRequestPagination & { module: string; includeBatchLoader: boolean };

export type ServerErrorSearchRequest = SearchRequestSorting &
    SearchRequestPagination &
    SearchRequestDateRange & { includeBadInput: boolean };

export type ClientErrorSearchRequest = SearchRequestSorting &
    SearchRequestPagination &
    SearchRequestDateRange & { includeUserAgents: string[] };

export type LoginRecordSearchRequest = SearchRequestSorting & SearchRequestPagination & SearchRequestDateRange;
