import { Router } from 'express';
import { loggedInMiddleware, nocacheMiddleware } from 'server/system/authorization';
import { config } from 'server/system/parseConfig';
import {
    getAtomsFromUMLS, getSourcePT, getValueSet, searchUmls, searchValueSet, umlsCuiFromSrc
} from 'server/uts/utsSvc';

export function module() {
    const router = Router();

    router.get('/searchValueSet/:vsacId', [nocacheMiddleware], async (req, res) => {
        const vsacId = req.params.vsacId;
        const {term, page} = req.query;
        res.send(await searchValueSet(vsacId, term, page));
    });

    router.get('/vsacBridge/:vsacId', [nocacheMiddleware], async (req, res) => {
        const vsacId = req.params.vsacId;
        res.send(await getValueSet(vsacId));
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
