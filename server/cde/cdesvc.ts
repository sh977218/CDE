import { Request, Response } from 'express';
import { handleError, handleErrorVoid, handleNotFound, respondError } from 'server/errorHandler/errorHandler';
import {
    byId as deById, byTinyId as deByTinyId, byTinyIdAndVersion as deByTinyIdAndVersion,
    byTinyIdListElastic as deByTinyIdListElastic,
    create as deCreate,
    DataElementDraft,
    dataElementModel, draftById as deDraftById, draftByTinyId as deDraftByTinyId, draftDelete as deDraftDelete,
    draftSave as deDraftSave,
    inCdeView, latestVersionByTinyId as deLatestVersionByTinyId,
    originalSourceByTinyIdSourceName as deOriginalSourceByTinyIdSourceName,
    update, findModifiedElementsSince, derivationByInputs, DataElementDocument
} from 'server/cde/mongo-cde';
import { badWorkingGroupStatus, hideProprietaryIds } from 'server/system/adminItemSvc';
import { RequestWithItem } from 'server/system/authorization';
import { addCdeToViewHistory, formatElt, sortArrayByArray } from 'server/system/mongo-data';
import { PermissibleValue, User } from 'shared/models.model';
import { canEditCuratedItem } from 'shared/system/authorizationShared';
import { stripBsonIdsElt } from 'shared/system/exportShared';
import { DataElement } from 'shared/de/dataElement.model';
import { orgByName } from 'server/orgManagement/orgDb';
import { moreLike } from 'server/cde/elastic';

const js2xml = require('js2xmlparser');

const sendDataElement = (req: Request, res: Response) => (dataElement: DataElementDocument) => {
    if (!req.user) {
        hideProprietaryCodes(dataElement);
    }
    if (req.query.type === 'xml') {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With');
        res.setHeader('Content-Type', 'application/xml');
        const cde = dataElement.toObject();
        return res.send(js2xml('dataElement', stripBsonIdsElt(cde)));
    }
    if (!req.user) {
        hideProprietaryCodes(dataElement);
    }
    res.send(dataElement);
    inCdeView(dataElement);
    addCdeToViewHistory(dataElement, req.user);
};

export function byId(req: Request, res: Response) {
    const id = req.params.id;
    deById(id, handleNotFound<DataElementDocument | null>({req, res}, sendDataElement(req, res)));
}

export function byTinyId(req: Request, res: Response) {
    const tinyId = req.params.tinyId;
    deByTinyId(tinyId, handleNotFound<DataElementDocument | null>({req, res}, sendDataElement(req, res)));
}

export function priorDataElements(req: Request, res: Response) {
    const id = req.params.id;
    deById(id, handleNotFound({req, res}, dataElement => {
        const history = dataElement.history.concat([dataElement._id]).reverse();
        dataElementModel.find({}, {
            'updatedBy.username': 1,
            updated: 1,
            changeNote: 1,
            version: 1,
            elementType: 1
        }).where('_id').in(history).exec(handleNotFound({req, res}, priorDataElements => {
            sortArrayByArray(priorDataElements, history);
            res.send(priorDataElements);
        }));
    }));
}

export function byTinyIdAndVersion(req: Request, res: Response) {
    const {tinyId, version} = req.params;
    deByTinyIdAndVersion(tinyId, version, handleNotFound({req, res}, dataElement => {
        if (!req.user) {
            hideProprietaryCodes(dataElement);
        }
        res.send(dataElement);
    }));
}

export function draftForEditByTinyId(req: Request, res: Response) { // WORKAROUND: send empty instead of 404 because angular litters console
    const handlerOptions = {req, res};
    const tinyId = req.params.tinyId;
    deByTinyId(tinyId, handleError(handlerOptions, elt => {
        if (!elt || !canEditCuratedItem(req.user, elt)) {
            res.send();
            return;
        }
        (function getDraft() {
            deDraftByTinyId(tinyId, handleError(handlerOptions, draft => {
                if (!draft) {
                    return res.send();
                }
                if (elt._id.toString() !== draft._id.toString()) {
                    deDraftDelete(tinyId, handleErrorVoid(handlerOptions, getDraft));
                    return respondError(new Error('Concurrency Error: Draft of prior elt should not exist'));
                }
                res.send(draft);
            }));
        })();
    }));
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

export function draftDelete(req: Request, res: Response) {
    deDraftDelete(req.params.tinyId, handleErrorVoid({req, res}, () => res.send()));
}

export function byTinyIdList(req: Request, res: Response) {
    const tinyIdList: string[] = req.params.tinyIdList.split(',');
    dataElementModel.find({archived: false}).where('tinyId')
        .in(tinyIdList)
        .exec(handleError({req, res}, dataElements => {
            const cdes = (dataElements || []).map(elt => {
                const r = formatElt(elt);
                if (!req.user) {
                    hideProprietaryCodes(r);
                }
                return r;
            });
            res.send(tinyIdList.map(t => cdes.filter(cde => cde.tinyId === t)[0]).filter(cde => !!cde));
        }));
}

export function latestVersionByTinyId(req: Request, res: Response) {
    const tinyId = req.params.tinyId;
    deLatestVersionByTinyId(tinyId, handleError({req, res}, latestVersion => res.send(latestVersion)));
}

export function create(req: Request, res: Response) {
    const elt = req.body;
    const user = req.user;
    if (!elt.stewardOrg || !elt.stewardOrg.name) { // validation???
        return res.status(400).send();
    }
    deCreate(elt, user, handleError({req, res}, dataElement => res.send(dataElement)));
}

function publish(req: RequestWithItem, res: Response, draft: DataElementDraft, options = {}) {
    const handlerOptions = {req, res};
    if (!draft) {
        return res.status(400).send();
    }
    const eltToArchive = req.item;
    orgByName(eltToArchive.stewardOrg.name || '', handleNotFound(handlerOptions, org => {
        if (badWorkingGroupStatus(eltToArchive, org)) {
            return res.status(403).send();
        }

        update(draft, req.user, options, handleError(handlerOptions, doc => {
            deDraftDelete(draft.tinyId, handleErrorVoid(handlerOptions, () => res.send(doc)));
        }));
    }));

}

export function publishFromDraft(req: Request, res: Response) {
    deDraftById(req.body._id, handleNotFound({req, res}, draft => {
        if (draft.__v !== req.body.__v) {
            return res.status(400).send('Cannot publish this old version. Reload and redo.');
        }
        publish(req, res, draft.toObject(), {
            updateAttachments: true,
            classification: true
        });
    }));
}

export function publishExternal(req: Request, res: Response) {
    deDraftById(req.body._id, handleError({req, res}, draft => {
        if (draft) {
            return res.status(400).send('Publishing would override an existing draft. Address the draft first.');
        }
        publish(req, res, req.body);
    }));
}

export function viewHistory(req: Request, res: Response) {
    if (!req.user) {
        return res.send('You must be logged in to do that');
    }
    const splicedArray: string[] = req.user.viewHistory.splice(0, 10);
    const tinyIdList: string[] = [];
    splicedArray.forEach(splice => {
        if (tinyIdList.indexOf(splice) === -1) {
            tinyIdList.push(splice);
        }
    });
    deByTinyIdListElastic(tinyIdList, handleNotFound({req, res}, dataElements => {
        dataElements.forEach(de => hideProprietaryCodes(de, req.user));
        return res.send(dataElements);
    }));
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
        pvSet.codeSystemName = hiddenFieldMessage;
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
    const dString: string = req.query.from;
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
