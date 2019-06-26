import { loggedInMiddleware, nocacheMiddleware } from '../../server/system/authorization';
import { config } from '../../server/system/parseConfig';

const utsSvc = require('./utsSvc');

export function module() {
    const router = require('express').Router();

    router.get('/searchValueSet/:vsacId', [nocacheMiddleware], async (req, res) => {
        const {vsacId, term, page} = req.params;
        let body = await utsSvc.searchValueSet(vsacId, term, page);
        res.send(body);
    });

    router.get('/vsacBridge/:vsacId', [nocacheMiddleware], async (req, res) => {
        let vsacId = req.params.vsacId;
        let vsacCodeXml = await utsSvc.getValueSet(vsacId, res);
        res.send(vsacCodeXml);
    });

    router.get('/searchUmls', [loggedInMiddleware], async (req, res) => {
        let umls = await utsSvc.searchUmls(req.query.searchTerm);
        res.send(umls);
    });

    router.get('/crossWalkingVocabularies/:source/:code/:targetSource/', async (req, res) => {
        const {source, code, targetSource} = req.params;
        let body = await utsSvc.getCrossWalkingVocabularies(source, code, targetSource);
        res.send(body);
    });


    // from UMLS to others
    router.get('/umlsAtomsBridge/:id/:src', async (req, res) => {
        let source = req.params.src;
        let id = req.params.id;
        if (!config.umls.sourceOptions[source]) {
            return res.send('Source cannot be looked up, use UTS Instead.');
        }
        if (config.umls.sourceOptions[source].requiresLogin && !req.user) {
            return res.status(403).send();
        }
        let result = await utsSvc.getAtomsFromUMLS(id, source);
        res.send(result);
    });


    // from others to UMLS
    router.get('/umlsCuiFromSrc/:id/:src', async (req, res) => {
        let source = req.params.src;
        let id = req.params.id;

        if (!config.umls.sourceOptions[source]) {
            return res.status(404).send('Source cannot be looked up, use UTS Instead.');
        }
        let result = await utsSvc.umlsCuiFromSrc(id, source);
        res.send(result);
    });

    return router;
}
