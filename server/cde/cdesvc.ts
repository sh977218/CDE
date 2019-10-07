import { Response } from 'express';
import * as js2xml from 'js2xmlparser';
import { handleError, handleNotFound, respondError } from 'server/errorHandler/errorHandler';
import {
    byId as deById, byTinyId as deByTinyId, byTinyIdAndVersion as deByTinyIdAndVersion, byTinyIdList as deByTinyIdList, create as deCreate,
    DataElementDraft,
    dataElementModel, draftById as deDraftById, draftByTinyId as deDraftByTinyId, draftDelete as deDraftDelete, draftSave as deDraftSave,
    inCdeView, latestVersionByTinyId as deLatestVersionByTinyId, originalSourceByTinyIdSourceName as deOriginalSourceByTinyIdSourceName,
    update
} from 'server/cde/mongo-cde';
import { badWorkingGroupStatus, hideProprietaryIds } from 'server/system/adminItemSvc';
import { RequestWithItem } from 'server/system/authorization';
import { addCdeToViewHistory, formatElt, sortArrayByArray } from 'server/system/mongo-data';
import { PermissibleValue, User } from 'shared/models.model';
import { canEditCuratedItem } from 'shared/system/authorizationShared';
import { stripBsonIdsElt } from 'shared/system/exportShared';
import { DataElement } from 'shared/de/dataElement.model';
import { orgByName } from 'server/orgManagement/orgDb';

export function byId(req, res) {
    const id = req.params.id;
    deById(id, handleNotFound({req, res}, dataElement => {
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
    }));
}

export function priorDataElements(req, res) {
    const id = req.params.id;
    deById(id, handleNotFound({req, res}, dataElement => {
        const history = dataElement.history.concat([dataElement._id]).reverse();
        dataElementModel.find({}, {
            'updatedBy.username': 1,
            updated: 1,
            changeNote: 1,
            version: 1,
            elementType: 1
        }).where('_id').in(history).exec(handleError({req, res}, priorDataElements => {
            sortArrayByArray(priorDataElements, history);
            res.send(priorDataElements);
        }));
    }));
}

export function byTinyId(req, res) {
    const tinyId = req.params.tinyId;
    deByTinyId(tinyId, handleNotFound({req, res}, dataElement => {
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
    }));
}

export function byTinyIdAndVersion(req, res) {
    const {tinyId, version} = req.params;
    deByTinyIdAndVersion(tinyId, version, handleNotFound({req, res}, dataElement => {
        if (!req.user) {
            hideProprietaryCodes(dataElement);
        }
        res.send(dataElement);
    }));
}

export function draftForEditByTinyId(req, res) { // WORKAROUND: sends empty instead of 404 to not cause angular to litter console
    const handlerOptions = {req, res};
    const tinyId = req.params.tinyId;
    deByTinyId(tinyId, handleError(handlerOptions, elt => {
        if (!canEditCuratedItem(req.user, elt) || !elt) {
            res.send();
            return;
        }
        (function getDraft() {
            deDraftByTinyId(tinyId, handleError(handlerOptions, draft => {
                if (!draft) {
                    return res.send();
                }
                if (elt._id.toString() !== draft._id.toString()) {
                    deDraftDelete(tinyId, handleError(handlerOptions, getDraft));
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

export function draftDelete(req, res) {
    deDraftDelete(req.params.tinyId, handleError({req, res}, () => res.send()));
}

export function byTinyIdList(req, res) {
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

export function latestVersionByTinyId(req, res) {
    const tinyId = req.params.tinyId;
    deLatestVersionByTinyId(tinyId, handleError({req, res}, latestVersion => res.send(latestVersion)));
}

export function create(req, res) {
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
    orgByName(eltToArchive.stewardOrg.name, handleError(handlerOptions, org => {
        if (badWorkingGroupStatus(eltToArchive, org)) {
            return res.status(403).send();
        }

        update(draft, req.user, options, handleError(handlerOptions, doc => {
            deDraftDelete(draft.tinyId, handleError(handlerOptions, () => res.send(doc)));
        }));
    }));

}

export function publishFromDraft(req, res) {
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

export function publishExternal(req, res) {
    deDraftById(req.body._id, handleError({req, res}, draft => {
        if (draft) {
            return res.status(400).send('Publishing would override an existing draft. Address the draft first.');
        }
        publish(req, res, req.body);
    }));
}

export function viewHistory(req, res) {
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
    deByTinyIdList(tinyIdList, handleNotFound({req, res}, dataElements => {
        dataElements.forEach(de => hideProprietaryCodes(de, req.user));
        return res.send(dataElements);
    }));
}

export function originalSourceByTinyIdSourceName(req, res) {
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
