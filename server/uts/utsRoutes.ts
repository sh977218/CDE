import { Router } from 'express';
import { loggedInMiddleware, nocacheMiddleware } from 'server/system/authorization';
import { config } from 'server/system/parseConfig';
import {
    getAtomsFromUMLS, getSourcePT, getValueSet, searchUmls, searchValueSet, umlsCuiFromSrc
} from 'server/uts/utsSvc';
import { parseString } from 'xml2js';

export function module() {
    const router = Router();

    router.get('/searchValueSet/:vsacId', [nocacheMiddleware], async (req, res) => {
        const vsacId = req.params.vsacId;
        const {term, page} = req.query;
        const xmlResp = await searchValueSet(vsacId, term, page);
        parseString(xmlResp, {ignoreAttrs: false, mergeAttrs: true}, (err, jsonResp) => {
            if (err) {
                res.status(400).send('Invalid XML from VSAC');
            } else {
                res.send(jsonResp);
            }
        });
    });

    router.get('/vsacBridge/:vsacId', [nocacheMiddleware], async (req, res) => {
        const vsacId = req.params.vsacId;
        const xmlResp = await getValueSet(vsacId);
        parseString(xmlResp, {ignoreAttrs: false, mergeAttrs: true}, (err, jsonResp) => {
            if (err) {
                res.status(400).send('Invalid XML from VSAC');
            } else {
                res.send(jsonResp);
            }
        });
    });

    router.get('/searchUmls', [loggedInMiddleware], async (req, res) => {
        res.send(await searchUmls(req.query.searchTerm));
    });

    router.get('/umlsPtSource/:cui/:src', async (req, res) => {
        const source = req.params.src;
        if (!config.umls.sourceOptions[source]) {
            return res.send('Source cannot be looked up, use UTS instead.');
        }
        if (config.umls.sourceOptions[source].requiresLogin && !req.user) {
            return res.status(403).send();
        }
        res.send(await getSourcePT(req.params.cui, source));
    });

    // from UMLS to others
    router.get('/umlsAtomsBridge/:id/:src', async (req, res) => {
        const id = req.params.id;
        const source = req.params.src;
        if (!config.umls.sourceOptions[source]) {
            return res.send('Source cannot be looked up, use UTS instead.');
        }
        if (config.umls.sourceOptions[source].requiresLogin && !req.user) {
            return res.status(403).send();
        }
        res.send(await getAtomsFromUMLS(id, source));
    });


    // from others to UMLS
    router.get('/umlsCuiFromSrc/:id/:src', async (req, res) => {
        const source = req.params.src;
        const id = req.params.id;

        if (!config.umls.sourceOptions[source]) {
            return res.status(404).send('Source cannot be looked up, use UTS instead.');
        }
        res.send(await umlsCuiFromSrc(id, source));
    });

    return router;
}
