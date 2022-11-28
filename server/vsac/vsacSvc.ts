import fetch from 'node-fetch';
import { config } from 'server';
import { consoleLog } from 'server/log/dbLogger';
import { handleErrors, isStatus, json, text } from 'shared/fetch';
import { toBase64 } from 'shared/node/nodeUtil';

type CodeSystem = {system: string, version: string, url: string};

const codeSystems: CodeSystem[] = [];
const fhirServer = 'https://cts.nlm.nih.gov/fhir';
let jwt = '';

function checkForVsacErrorPage(body: string): string {
    if (body.indexOf('<html>') !== -1) {
        throw new Error('error response');
    }
    return body;
}

function getCodeSystems(): Promise<CodeSystem[]> {
    if (codeSystems.length !== 0) {
        return Promise.resolve(codeSystems);
    }
    return fetch(`${fhirServer}/metadata`)
        .then<any>(json)
        .then(metadata => {
            codeSystems.length = 0;
            metadata.extension.forEach((extension: any) => {
                const codeSystem: Partial<CodeSystem> = {};
                extension.extension.forEach((e: any) => {
                    switch (e.url) {
                        case 'name':
                            codeSystem.system = e.valueString;
                            break;
                        case 'system':
                            codeSystem.url = e.valueUri;
                            break;
                        case 'version':
                            codeSystem.version = e.valueString;
                            break;
                    }
                });
                codeSystems.push(codeSystem as CodeSystem);
            });
            return codeSystems;
        });
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

function optionFhir(apiKey: string) {
    const auth = toBase64(`apikey:${apiKey}`);
    return {headers: {Authorization: `Basic ${auth}`}};
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

export function getValueSet(oid: string): Promise<VsacValueSetResponse | null> {
    function fetchValueSet(): Promise<VsacValueSetResponse | null> {
        return getCodeSystems()
            .then(() => fetch(`${fhirServer}/ValueSet/${oid}`, optionFhir(config.uts.apikey)))
            .then(isStatus([200, 404]))
            .then<any>(json)
            .then(response => {
                if (!response?.compose?.include) {
                    return null;
                }
                const concepts: VsacConcept[] = [];
                response.compose.include.forEach((include: any) => {
                    let system = '';
                    let version = '';
                    const codeSystem = codeSystems.filter(c => c.url === include.system)[0];
                    if (codeSystem) {
                        system = codeSystem.system;
                        version = codeSystem.version;
                        include.concept.forEach((concept: any) => {
                            concepts.push({
                                code: concept.code,
                                displayName: concept.display,
                                codeSystemName: system,
                                codeSystemVersion: version,
                            });
                        });
                    }
                });
                return {id: response.id, name: response.name, version: response.version, concepts};
            }, handleReject('get vsac set ERROR'));
    }

    return fetchValueSet()
        .catch(err => {
            consoleLog(err);
            return fetchValueSet();
        });
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
