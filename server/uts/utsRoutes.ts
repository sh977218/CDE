import { Router } from 'express';
import { config } from 'server';
import { loggedInMiddleware, nocacheMiddleware } from 'server/system/authorization';
import {
    getAtomsFromUMLS, getSourcePT, searchUmls, umlsCuiFromSrc
} from 'server/uts/utsSvc';
import { getValueSet, searchValueSet } from 'server/vsac/vsacSvc';
import { parseString } from 'xml2js';

export function module() {
    const router = Router();

    router.get('/searchValueSet/:vsacId', nocacheMiddleware, (req, res) => {
        const vsacId = req.params.vsacId;
        const {term, page} = req.query as {term: string, page: string};
        searchValueSet(vsacId, term, page).then(
            result => res.send(result),
            error => res.status(400).send()
        );
    });

    router.get('/vsacBridge/:vsacId', nocacheMiddleware, (req, res) => {
        const vsacId = req.params.vsacId;
        getValueSet(vsacId).then(
            resp => resp ? res.send(resp) : res.status(404).send(),
            err => res.status(400).send()
        );
    });

    router.get('/searchUmls', loggedInMiddleware, (req, res) => {
        searchUmls(req.query.searchTerm as string).then(
            result => res.send(result),
            error => res.status(400).send()
        );
    });

    router.get('/umlsPtSource/:cui/:src', (req, res) => {
        const source = req.params.src;
        if (!config.umls.sourceOptions[source]) {
            return res.send('Source cannot be looked up, use UTS instead.');
        }
        if (config.umls.sourceOptions[source].requiresLogin && !req.user) {
            return res.status(403).send();
        }
        getSourcePT(req.params.cui, source).then(
            result => res.send(result),
            error => res.status(400).send()
        );
    });

    // from UMLS to others
    router.get('/umlsAtomsBridge/:id/:src', (req, res) => {
        const id = req.params.id;
        const source = req.params.src;
        if (!config.umls.sourceOptions[source]) {
            return res.send('Source cannot be looked up, use UTS instead.');
        }
        if (config.umls.sourceOptions[source].requiresLogin && !req.user) {
            return res.status(403).send();
        }
        getAtomsFromUMLS(id, source).then(
            result => res.send(result),
            error => res.status(400).send()
        );
    });


    // from others to UMLS
    router.get('/umlsCuiFromSrc/:id/:src', (req, res) => {
        const source = req.params.src;
        const id = req.params.id;

        if (!config.umls.sourceOptions[source]) {
            return res.status(404).send('Source cannot be looked up, use UTS instead.');
        }
        umlsCuiFromSrc(id, source).then(
            result => res.send(result),
            error => res.status(400).send()
        );
    });

    return router;
}
