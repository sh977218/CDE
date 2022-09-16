import { Request, Response } from 'express';
import { dbPlugins } from 'server';
import { moreLike } from 'server/cde/elastic.moreLike';
import {
    create as deCreate,
    DataElementDraft,
    dataElementModel, draftById as deDraftById, draftByTinyId as deDraftByTinyId, draftDelete as deDraftDelete,
    draftSave as deDraftSave,
    inCdeView,
    originalSourceByTinyIdSourceName as deOriginalSourceByTinyIdSourceName,
    update, findModifiedElementsSince, derivationByInputs
} from 'server/cde/mongo-cde';
import { handleError, respondError } from 'server/errorHandler';
import { orgByName } from 'server/orgManagement/orgDb';
import { badWorkingGroupStatus, hideProprietaryIds } from 'server/system/adminItemSvc';
import { RequestWithItem } from 'server/system/authorization';
import { addCdeToViewHistory, sortArrayByArray } from 'server/system/mongo-data';
import { DataElement } from 'shared/de/dataElement.model';
import { UpdateEltOptions } from 'shared/de/updateEltOptions';
import { stripBsonIdsElt } from 'shared/exportShared';
import { PermissibleValue, User } from 'shared/models.model';
import { canEditCuratedItem } from 'shared/security/authorizationShared';

const js2xml = require('js2xmlparser');

const sendDataElement = (req: Request, res: Response) => (dataElement: DataElement): Response => {
    if (!req.user) {
        hideProprietaryCodes(dataElement);
    }
    if (req.query.type === 'xml') {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With');
        res.setHeader('Content-Type', 'application/xml');
        const cde = dataElement;
        return res.send(js2xml('dataElement', stripBsonIdsElt(cde)));
    }
    inCdeView(dataElement);
    addCdeToViewHistory(dataElement, req.user);
    return res.send(dataElement);
};

export function byId(req: Request, res: Response): Promise<Response> {
    const id = req.params.id;
    return dbPlugins.dataElement.byId(id)
        .then(item => {
            if (!item) {
                return res.status(404).send();
            }
            return sendDataElement(req, res)(item);
        }, respondError({req, res}));
}

export function byTinyId(req: Request, res: Response): Promise<Response> {
    const tinyId = req.params.tinyId;
    return dbPlugins.dataElement.byTinyId(tinyId)
        .then(item => {
            if (!item) {
                return res.status(404).send();
            }
            return sendDataElement(req, res)(item);
        }, respondError({req, res}));
}

export function priorDataElements(req: Request, res: Response): Promise<Response> {
    const id = req.params.id;
    return dbPlugins.dataElement.byId(id)
        .then(dataElement => {
            if (!dataElement) {
                return res.status(404).send();
            }
            const history = dataElement.history.concat([dataElement._id]).reverse();
            return dataElementModel.find({}, {
                'updatedBy.username': 1,
                updated: 1,
                changeNote: 1,
                version: 1,
                elementType: 1
            }).where('_id').in(history)
                .then(priorDataElements => {
                    sortArrayByArray(priorDataElements, history);
                    return res.send(priorDataElements);
                });
        })
        .catch(respondError({req, res}));
}

export function byTinyIdAndVersion(req: Request, res: Response): Promise<Response> {
    const {tinyId, version} = req.params;
    return dbPlugins.dataElement.byTinyIdAndVersion(tinyId, version)
        .then(dataElement => {
            if (!dataElement) {
                return res.status(404).send();
            }
            if (!req.user) {
                hideProprietaryCodes(dataElement);
            }
            return res.send(dataElement);
        }, respondError({req, res}));
}

export function draftForEditByTinyId(req: Request, res: Response): Promise<Response> {
    const tinyId = req.params.tinyId;
    return dbPlugins.dataElement.byTinyId(tinyId)
        .then(elt => {
            if (!elt || !canEditCuratedItem(req.user, elt)) {
                return res.send();  // WORKAROUND: send empty instead of 404 because angular litters console
            }
            return (function getDraft(): Promise<Response> {
                return deDraftByTinyId(tinyId).then(draft => {
                    if (!draft) {
                        return res.send();
                    }
                    if (elt._id.toString() !== draft._id.toString()) {
                        respondError(new Error('Concurrency Error: Draft of prior elt should not exist'));
                        return deDraftDelete(tinyId).then(getDraft);
                    }
                    return res.send(draft);
                });
            })();
        })
        .catch(respondError({req, res}));
}

export function draftSave(req: RequestWithItem, res: Response) {
    const elt = req.body;
    const tinyId = req.params.tinyId;
    if (!elt || !tinyId || elt.tinyId !== tinyId || elt._id !== req.item._id.toString()) {
        return res.status(400).send();
    }
    deDraftSave(elt, req.user, handleError({req, res}, elt => {
        if (!elt) {
            return res.status(409).send('Edited by someone else. Please refresh and redo.');
        }
        res.send(elt);
    }));
}

export function draftDelete(req: Request, res: Response): Promise<Response> {
    return deDraftDelete(req.params.tinyId).then(() => res.send(), respondError({req, res}));
}

export function byTinyIdList(req: Request, res: Response) {
    const tinyIdList: string[] = (req.params.tinyIdList || '').split(',');
    return dbPlugins.dataElement.byTinyIdListElastic(tinyIdList).then(items => {
        hideProprietaryCodes(items, req.user);
        return res.send(items);
    })
}

export function latestVersionByTinyId(req: Request, res: Response): Promise<Response> {
    return dbPlugins.dataElement.versionByTinyId(req.params.tinyId)
        .then(version => res.send(version), respondError({req, res}));
}

export function create(req: Request, res: Response) {
    const elt = req.body;
    const user = req.user;
    if (!elt.stewardOrg || !elt.stewardOrg.name) { // validation???
        return res.status(400).send();
    }
    deCreate(elt, user, handleError({req, res}, dataElement => res.send(dataElement)));
}

function publish(req: RequestWithItem, res: Response, draft: DataElementDraft, options: UpdateEltOptions = {}): Promise<Response> {
    if (!draft) {
        return Promise.resolve(res.status(400).send());
    }
    const eltToArchive = req.item;
    return orgByName(eltToArchive.stewardOrg.name).then(org => {
        if (!org) {
            return res.status(404).send();
        }
        if (badWorkingGroupStatus(eltToArchive, org)) {
            return res.status(403).send();
        }
        return update(draft, req.user, options).then(doc =>
            deDraftDelete(draft.tinyId).then(() =>
                res.send(doc)
            )
        );
    })
        .catch(respondError({req, res}));
}

export function publishFromDraft(req: Request, res: Response): Promise<Response> {
    return deDraftById(req.body._id).then(draft => {
        /* istanbul ignore if */
        if (!draft) {
            return res.status(404).send();
        }
        if (draft.__v !== req.body.__v) {
            return res.status(400).send('Cannot publish this old version. Reload and redo.');
        }
        return publish(req, res, draft.toObject());
    }, respondError({req, res}));
}

export function publishExternal(req: Request, res: Response) {
    const de: DataElement = req.body;
    return deDraftById(de._id).then(draft => {
        if (draft) {
            return res.status(400).send('Publishing would override an existing draft. Address the draft first.');
        }
        return publish(req, res, de, {
            updateAttachments: true,
            updateSource: true
        });
    }, respondError({req, res}));
}

export function viewHistory(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
        return Promise.resolve(res.send('You must be logged in to do that'));
    }
    const splicedArray: string[] = req.user.viewHistory.splice(0, 10);
    const tinyIdList: string[] = [];
    splicedArray.forEach(splice => {
        if (tinyIdList.indexOf(splice) === -1) {
            tinyIdList.push(splice);
        }
    });
    return dbPlugins.dataElement.byTinyIdListElastic(tinyIdList)
        .then(dataElements => {
            hideProprietaryCodes(dataElements, req.user);
            return res.send(dataElements);
        }, respondError({req, res}));
}

export function originalSourceByTinyIdSourceName(req: Request, res: Response) {
    const tinyId = req.params.tinyId;
    const sourceName = req.params.sourceName;
    deOriginalSourceByTinyIdSourceName(tinyId, sourceName,
        handleError({req, res}, originalSource => {
            if (originalSource) {
                res.send(originalSource);
            } else {
                res.status(404).send('No ' + sourceName + ' source file found for ' + tinyId);
            }
        })
    );
}

/* ---------- PUT NEW REST API Implementation above  ---------- */

const systemWhitelist = ['RXNORM', 'HSLOC', 'CDCREC', 'SOP', 'AHRQ', 'HL7', 'CDC Race and Ethnicity', 'NCI', 'UMLS'];

function censorPv(pvSet: PermissibleValue) {
    const hiddenFieldMessage = 'Login to see the value.';
    let toBeCensored = true;
    systemWhitelist.forEach(system => {
        if (!pvSet.codeSystemName || pvSet.codeSystemName.indexOf(system) >= 0) {
            toBeCensored = false;
        }
    });
    if (toBeCensored) {
        pvSet.valueMeaningName = hiddenFieldMessage;
        pvSet.valueMeaningCode = hiddenFieldMessage;
        (pvSet.codeSystemName as any) = hiddenFieldMessage;
        pvSet.codeSystemVersion = hiddenFieldMessage;
    }
}

function checkCde(cde: DataElement) {
    hideProprietaryIds(cde);
    if (cde.valueDomain && cde.valueDomain.datatype === 'Value List') {
        cde.valueDomain.permissibleValues.forEach(censorPv);
    }
    return cde;
}

export function hideProprietaryCodes(cdes: DataElement | DataElement[], user?: User) {
    if (!cdes || user) {
        return cdes;
    }
    if (!Array.isArray(cdes)) {
        return checkCde(cdes);
    }
    cdes.forEach(cde => checkCde(cde));
    return cdes;
}

export function moreLikeThis(req: Request, res: Response) {
    moreLike(req.params.tinyId, result => {
        hideProprietaryCodes(result.cdes, req.user);
        res.send(result);
    });
}

export function modifiedElements(req: Request, res: Response) {
    const dString = req.query.from as string;
    const r = /20[0-2][0-9]-[0-1][0-9]-[0-3][0-9]/;

    function badDate() {
        res.status(300).send('Invalid date format, please provide as: /api/cde/modifiedElements?from=2015-12-24');
    }

    if (!r.test(dString)) {
        return badDate();
    }

    const date = new Date(dString);
    findModifiedElementsSince(date,
        (err, elts) => res.send(elts.map(e => ({tinyId: e._id}))));
}

export function derivationOutputs(req: Request, res: Response) {
    derivationByInputs(req.params.inputCdeTinyId, handleError({req, res}, cdes => res.send(cdes)));
}
