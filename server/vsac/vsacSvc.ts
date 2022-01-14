import fetch from 'node-fetch';
import { config } from 'server';
import { consoleLog } from 'server/log/dbLogger';
import { json, text } from 'shared/fetch';

let jwt = '';

function checkForVsacErrorPage(body: string): string {
    if (body.indexOf('<html>') !== -1) {
        throw new Error('error response');
    }
    return body;
}

function getJwt(): Promise<string> {
    if (jwt) {
        return Promise.resolve(jwt);
    }
    return fetch(`${config.vsac.host}/vsac/login/byApikey`, {
        method: 'POST',
        headers: {'Content-type': 'application/json'},
        body: `apikey=${config.uts.apikey}`
    }).then(res => {
        const bearer = res.headers.raw().authorization[0];
        if (!bearer.startsWith('Bearer ')) {
            throw 'vsac not logged in';
        }
        jwt = bearer.substr(7);
        return jwt;
    })
}

function optionJwt(jwt: string) {
    return {headers: {Authorization: `Bearer ${jwt}`}};
}

function getRevision(oid: string, uri: string): Promise<string> {
    return getJwt()
        .then(jwt => fetch(`${config.vsac.host}/vsac/pc/vs/valueset/${oid}/detail?label=Latest`, optionJwt(jwt)))
        .then<any>(json)
        .then(
            body => body.revision,
            handleReject('get revision ERROR')
        );
}

function handleReject(message: string) {
    return (error: Error) => {
        consoleLog(message + error);
        jwt = '';
        throw error;
    };
}

export function searchValueSet(oid: string, term = '', page = '1'): Promise<string> {
    const uri = `${config.vsac.host}/vsac/pc/code/codes`;
    return getJwt()
        .then(jwt => getRevision(oid, uri)
            .then(revision => fetch(uri, Object.assign({
                method: 'POST',
                body: (
                    term
                        /* tslint:disable */
                        ? '{"_search":true,"rows":"120","page":"$page","sortName":"code","sortOrder":"asc","oid":"$oid","revision":"$revision","expRevision":null,"label":"Latest","effDate":null,"filters":"{\\"groupOp\\":\\"AND\\",\\"rules\\":[{\\"field\\":\\"displayname\\",\\"op\\":\\"cn\\",\\"data\\":\\"$term\\"}]}","filterFields":{"groupOp":"AND","rules":[{"field":"displayname","op":"cn","data":"$term"}]}}'
                        : '{"_search":false,"rows":"120","page":"$page","sortName":"code","sortOrder":"asc","oid":"$oid","revision":"$revision","expRevision":null,"label":"Latest","effDate":null,"filters":"{\\"groupOp\\":\\"AND\\",\\"rules\\":[]}","filterFields":{"groupOp":"AND","rules":[]}}'
                    /* tslint:enable */
                )
                    .replace('$oid', oid)
                    .replace('$page', page)
                    .replace('$revision', revision)
                    .replace(/\$term/g, term),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            }, optionJwt(jwt))))
        )
        .then(text)
        .then(checkForVsacErrorPage, handleReject('searchValueSet ERROR'));
}
