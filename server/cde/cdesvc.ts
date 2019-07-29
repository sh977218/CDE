import { handle404, handleError, respondError } from '../errorHandler/errorHandler';
import { User } from 'shared/models.model';
import { canEditCuratedItem } from 'shared/system/authorizationShared';
import { stripBsonIds } from 'shared/system/exportShared';

const _ = require('lodash');
const js2xml = require('js2xmlparser');
const adminItemSvc = require('../system/adminItemSvc');
const mongo_data = require('../system/mongo-data');
const mongo_cde = require('./mongo-cde');

export function byId(req, res) {
    let id = req.params.id;
    mongo_cde.byId(id, handle404({req, res}, dataElement => {
        if (!req.user) hideProprietaryCodes(dataElement);
        if (req.query.type === 'xml') {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'X-Requested-With');
            res.setHeader('Content-Type', 'application/xml');
            let cde = dataElement.toObject();
            return res.send(js2xml('dataElement', stripBsonIds(cde)));
        }
        if (!req.user) hideProprietaryCodes(dataElement);
        res.send(dataElement);
        mongo_cde.inCdeView(dataElement);
        mongo_data.addCdeToViewHistory(dataElement, req.user);
    }));
}

export function priorDataElements(req, res) {
    let id = req.params.id;
    mongo_cde.byId(id, handle404({req, res}, dataElement => {
        let history = dataElement.history.concat([dataElement._id]).reverse();
        mongo_cde.DataElement.find({}, {
            'updatedBy.username': 1,
            updated: 1,
            changeNote: 1,
            version: 1,
            elementType: 1
        }).where('_id').in(history).exec(handleError({req, res}, priorDataElements => {
            mongo_data.sortArrayByArray(priorDataElements, history);
            res.send(priorDataElements);
        }));
    }));
}

export function byTinyId(req, res) {
    let tinyId = req.params.tinyId;
    mongo_cde.byTinyId(tinyId, handle404({req, res}, dataElement => {
        if (!req.user) hideProprietaryCodes(dataElement);
        if (req.query.type === 'xml') {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'X-Requested-With');
            res.setHeader('Content-Type', 'application/xml');
            let cde = dataElement.toObject();
            return res.send(js2xml('dataElement', stripBsonIds(cde)));
        }
        if (!req.user) hideProprietaryCodes(dataElement);
        res.send(dataElement);
        mongo_cde.inCdeView(dataElement);
        mongo_data.addCdeToViewHistory(dataElement, req.user);
    }));
}

export function byTinyIdAndVersion(req, res) {
    const {tinyId, version} = req.params;
    mongo_cde.byTinyIdAndVersion(tinyId, version, handle404({req, res}, dataElement => {
        if (!req.user) hideProprietaryCodes(dataElement);
        res.send(dataElement);
    }));
}

export function draftForEditByTinyId(req, res) { // WORKAROUND: sends empty instead of 404 to not cause angular to litter console
    const handlerOptions = {req, res};
    const tinyId = req.params.tinyId;
    mongo_cde.byTinyId(tinyId, handleError(handlerOptions, elt => {
        if (!canEditCuratedItem(req.user, elt)) {
            res.send();
            return;
        }
        (function getDraft() {
            mongo_cde.draftByTinyId(tinyId, handleError(handlerOptions, draft => {
                if (draft && elt._id.toString() !== draft._id.toString()) {
                    mongo_cde.draftDelete(tinyId, handleError(handlerOptions, () =>
                        getDraft()
                    ));
                    respondError(new Error('Concurrency Error: Draft of prior elt should not exist'));
                    return;
                }
                res.send(draft);
            }));
        })();
    }));
}

export function draftSave(req, res) {
    let elt = req.body;
    let tinyId = req.params.tinyId;
    if (!elt || !tinyId || elt.tinyId !== tinyId || elt._id !== req.item._id.toString()) {
        return res.status(400).send();
    }
    mongo_cde.draftSave(elt, req.user, handleError({req, res}, elt => {
        if (!elt) {
            res.status(409).send('Edited by someone else. Please refresh and redo.');
            return;
        }
        res.send(elt);
    }));
}

export function draftDelete(req, res) {
    mongo_cde.draftDelete(req.params.tinyId, handleError({req, res}, () => res.send()));
}

export function byTinyIdList(req, res) {
    let tinyIdList = req.params.tinyIdList.split(',');
    mongo_cde.DataElement.find({archived: false}).where('tinyId')
        .in(tinyIdList)
        .exec(handleError({req, res}, dataElements => {
            let result = [];
            dataElements = dataElements.map(elt => {
                let r = mongo_data.formatElt(elt);
                if (!req.user) hideProprietaryCodes(r);
                return r;
            });
            _.forEach(tinyIdList, t => {
                let c = _.find(dataElements, cde => cde.tinyId === t);
                if (c) result.push(c);
            });
            res.send(result);
        }));
}

export function latestVersionByTinyId(req, res) {
    let tinyId = req.params.tinyId;
    mongo_cde.latestVersionByTinyId(tinyId, handleError({req, res}, latestVersion => res.send(latestVersion)));
}

export function create(req, res) {
    let elt = req.body;
    let user = req.user;
    if (!elt.stewardOrg || !elt.stewardOrg.name) return res.status(400).send(); // validation???
    mongo_cde.create(elt, user, handleError({req, res}, dataElement => res.send(dataElement)));
}

function publish(req, res, draft, options = {}) {
    const handlerOptions = {req, res};
    if (!draft) {
        return res.status(400).send();
    }
    const eltToArchive = req.item;
    mongo_data.orgByName(eltToArchive.stewardOrg.name, handleError(handlerOptions, org => {
        if (adminItemSvc.badWorkingGroupStatus(eltToArchive, org)) {
            return res.status(403).send();
        }

        mongo_cde.update(draft, req.user, options, handleError(handlerOptions, doc => {
            mongo_cde.draftDelete(draft.tinyId, handleError(handlerOptions, () => res.send(doc)));
        }));
    }));

}

export function publishFromDraft(req, res) {
    mongo_cde.draftById(req.body._id, handle404({req, res}, draft => {
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
    mongo_cde.draftById(req.body._id, handleError({req, res}, draft => {
        if (draft) {
            return res.status(400).send('Publishing would override an existing draft. Address the draft first.');
        }
        publish(req, res, req.body);
    }));
}

export function viewHistory(req, res) {
    if (!req.user) return res.send('You must be logged in to do that');
    let splicedArray = req.user.viewHistory.splice(0, 10);
    let tinyIdList = [];
    for (let i = 0; i < splicedArray.length; i++) {
        if (tinyIdList.indexOf(splicedArray[i]) === -1) {
            tinyIdList.push(splicedArray[i]);
        }
    }
    mongo_cde.byTinyIdList(tinyIdList, handleError({req, res}, dataElements => {
        dataElements.forEach(de => hideProprietaryCodes(de, req.user));
        return res.send(dataElements);
    }));
}

export function originalSourceByTinyIdSourceName(req, res) {
    let tinyId = req.params.tinyId;
    let sourceName = req.params.sourceName;
    mongo_cde.originalSourceByTinyIdSourceName(tinyId, sourceName,
        handleError({req, res}, originalSource => {
            if (originalSource) res.send(originalSource);
            else res.status(404).send('No ' + sourceName + ' source file found for ' + tinyId);
        })
    );
}

/* ---------- PUT NEW REST API Implementation above  ---------- */

let systemWhitelist = ['RXNORM', 'HSLOC', 'CDCREC', 'SOP', 'AHRQ', 'HL7', 'CDC Race and Ethnicity', 'NCI', 'UMLS'];

function censorPv(pvSet) {
    let hiddenFieldMessage = 'Login to see the value.';
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

function checkCde(cde) {
    adminItemSvc.hideProprietaryIds(cde);
    if (cde.valueDomain && cde.valueDomain.datatype !== 'Value List') return cde;
    cde.valueDomain && cde.valueDomain.permissibleValues.forEach(pvSet => {
        censorPv(pvSet);
    });
    return cde;
}

export function hideProprietaryCodes(cdes, user?: User) {
    if (!cdes) return cdes;
    if (user) return cdes;
    if (!Array.isArray(cdes)) return checkCde(cdes);
    cdes.forEach(cde => checkCde(cde));
    return cdes;
}
