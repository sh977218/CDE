import { config } from 'server/system/parseConfig';
import { logError } from 'server/log/dbLogger';
import { CdeForm } from 'shared/form/form.model';
import { CbError1 } from 'shared/models.model';

const AWS = require('aws-sdk');

export function sdcExport(xmlStr: string, form: CdeForm, cb: CbError1<string>) {
    if (!(global as any).CURRENT_SERVER_ENV) {
        throw new Error('ENV not ready');
    }
    // test error: xmlStr = xmlStr.replace(/<List>.*<\/List>/g, '');
    const jsonPayload = {
        input: xmlStr
    };
    const params = {
        FunctionName: config.cloudFunction.formSdcValidate.name + '-' + (global as any).CURRENT_SERVER_ENV,
        Payload: JSON.stringify(jsonPayload)
    };
    const validateCb = (err: Error | null, data: any) => {
        if (err || !data) {
            logError({
                message: 'SDC Schema validation AWS error: ',
                stack: err ? err.stack : undefined,
                details: 'formID: ' + form._id
            });
            cb(err, '<!-- Validation Error: general error -->' + xmlStr);
            return;
        }
        const res = JSON.parse(data.Payload);
        if (res.body) {
            const body = JSON.parse(res.body);
            if (body.message) {
                xmlStr = '<!-- Validation Error: ' + body.message + ' -->' + xmlStr;
            }
        }
        cb(null, xmlStr);
    };
    new AWS.Lambda({region: 'us-east-1'}).invoke(params, validateCb);
}
