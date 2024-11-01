import * as mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';
import { config } from 'server';
import { addStringtype } from 'server/system/mongoose-stringtype';
import { AppLog, ClientError, ErrorLog, HttpLog, LoginRecord } from 'shared/log/audit';

export type AppLogDocument = Document & AppLog;
export type ClientErrorDocument = Document & ClientError;
export type ErrorLogDocument = Document & ErrorLog;
export type HttpLogDocument = Document<string, null, HttpLog> & HttpLog;
export type LoginRecordDocument = Document & LoginRecord;

addStringtype(mongoose);
const StringType = (Schema.Types as any).StringType;

const cappedSize = config.database.log.cappedCollectionSizeMB;

export const consoleLogSchema = new Schema<AppLogDocument>(
    {
        // everything server except express
        date: { type: Date, index: true, default: Date.now },
        message: StringType,
        level: { type: StringType, enum: ['debug', 'info', 'warning', 'error'], default: 'info' },
    },
    { w: 0, capped: cappedSize } as any
);

export const logSchema = new Schema<HttpLogDocument>(
    {
        // express
        level: StringType,
        remoteAddr: { type: StringType, index: true },
        url: StringType,
        method: StringType,
        httpStatus: StringType,
        date: { type: Date, index: true },
        referrer: StringType,
        responseTime: { type: Number, index: true },
    },
    { w: 0, capped: cappedSize } as any
);

export const logErrorSchema = new Schema<ErrorLogDocument>(
    {
        // server
        message: StringType,
        date: { type: Date, index: true },
        details: StringType,
        origin: StringType,
        stack: StringType,
        badInput: Boolean,
        request: {
            url: StringType,
            method: StringType,
            params: StringType,
            body: StringType,
            username: StringType,
            userAgent: StringType,
            ip: StringType,
            errorCode: StringType,
            errorType: StringType,
        },
    },
    { w: 0, capped: cappedSize } as any
);

export const clientErrorSchema = new Schema<ClientErrorDocument>(
    {
        message: StringType,
        date: { type: Date, index: true },
        origin: StringType,
        name: StringType,
        stack: StringType,
        userAgent: StringType,
        url: StringType,
        username: StringType,
        ip: StringType,
    },
    { w: 0, capped: cappedSize } as any
);

export const loginSchema = new Schema<LoginRecordDocument>(
    {
        date: { type: Date, index: true, default: Date.now },
        user: StringType,
        email: StringType,
        ip: { type: StringType, index: true },
    },
    { w: 0 } as any
);
