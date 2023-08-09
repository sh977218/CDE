import { EventEmitter } from 'events';
import { Response, Router } from 'express';
import {
    canSubmissionReviewMiddleware,
    canSubmissionSubmitMiddleware, loggedInMiddleware
} from 'server/system/authorization';
import { config, dbPlugins, ObjectId } from 'server';
import { removeUnusedAttachment, saveFile } from 'server/attachment/attachmentSvc';
import * as multer from 'multer';
import { getFile } from 'server/mongo/mongo/gfs';
import { respondError } from 'server/errorHandler';
import { processWorkBook } from 'server/submission/submissionSvc';
import { Submission, SubmissionAttachment } from 'shared/boundaryInterfaces/db/submissionDb';
import { canSubmissionReview, canSubmissionSubmit } from 'shared/security/authorizationShared';
import { read as readXlsx } from 'xlsx';

export function module() {
    const router = Router();
    const emitters: Record<string, EventEmitter | null> = {};

    router.post('/attach', canSubmissionSubmitMiddleware,
        multer({...config.multer, storage: multer.memoryStorage()}).any(),
        async (req, res): Promise<Response> => {
            const newFile = (req.files as any)[0];
            const _id = req.body.id;
            const location: 'attachmentWorkbook' | 'attachmentSupporting' = req.body.location;
            if (!_id || !location || !newFile || !['attachmentWorkbook', 'attachmentSupporting'].includes(location)) {
                return Promise.resolve(res.status(400).send('bad request'));
            }
            const submission = await dbPlugins.submission.byId(_id);
            const fileId = submission?.[location]?.fileId
            if (fileId) {
                await removeUnusedAttachment(fileId);
            }
            const newId = await saveFile(newFile).then(newId => newId.toString());
            const newSubmission = await dbPlugins.submission.updatePropertiesById(_id, {
                [location]: {
                    fileId: newId,
                    filename: newFile.originalname,
                    uploadedBy: req.user._id,
                    uploadedDate: new Date().toJSON(),
                } as SubmissionAttachment
            });
            return res.send(newSubmission?.[location]);
        }
    );

    router.get('/', loggedInMiddleware, async (req, res): Promise<Response> => {
        const query: any = {};
        if (!canSubmissionReview(req.user)) {
            if (!canSubmissionSubmit(req.user)) {
                return res.status(403).send('not authorized');
            } else {
                query.submitterId = req.user._id;
            }
        }
        return res.send(await dbPlugins.submission.query(query));
    });

    router.post('/decline', canSubmissionReviewMiddleware, (req, res): Promise<Response> => {
        return dbPlugins.submission.byId(req.body._id).then(async dbSubmission => {
            if (!dbSubmission) {
                return res.status(404).send();
            }
            if (dbSubmission.endorsed) {
                return res.status(400).send('Already published.')
            }
            dbSubmission.administrativeStatus = 'Not Endorsed';
            return res.send(await dbPlugins.submission.save(dbSubmission));
        });
    });

    router.get('/:id', canSubmissionSubmitMiddleware, async (req, res): Promise<Response> => {
        return res.send(await dbPlugins.submission.byId(req.params.id));
    });

    router.put('/', canSubmissionSubmitMiddleware, (req, res): Promise<Response> => {
        const submission: Partial<Submission> = req.body;
        if (!submission || !submission.name || !submission.version) {
            return Promise.resolve(res.status(400).send());
        }
        return dbPlugins.submission.byNameAndVersion(submission.name, submission.version).then(async dbSubmission => {
            if (dbSubmission) {
                if (dbSubmission._id.toString() !== submission._id) {
                    return res.status(409).send('Already exists, cannot ' + (submission._id ? 'replace' : 'create'));
                }
                if (!canSubmissionReview(req.user) && dbSubmission.submitterId.toString() !== req.user._id.toString()) {
                    return res.status(403).send('Not the owner');
                }
                if (dbSubmission.endorsed) {
                    return res.status(400).send('Already published.')
                }
                if (!canSubmissionReview(req.user)) {
                    submission.administrativeStatus = dbSubmission.administrativeStatus;
                    submission.registrationStatus = dbSubmission.registrationStatus;
                }
            } else {
                if (!canSubmissionReview(req.user)) {
                    submission.administrativeStatus = 'Not Endorsed';
                    submission.registrationStatus = 'Incomplete';
                }
            }
            if (!submission.administrativeStatus) {
                submission.administrativeStatus = 'Not Endorsed';
            }
            if (!submission.registrationStatus) {
                submission.registrationStatus = 'Incomplete';
            }
            submission.endorsed = false;
            submission.submitterId = req.user._id;
            return res.send(await dbPlugins.submission.save(submission as Submission));
        });
    });

    router.delete('/:id', canSubmissionSubmitMiddleware, (req, res): Promise<Response> => {
        const _id = req.params.id;
        return dbPlugins.submission.byId(_id).then(async dbSubmission => {
            if (!dbSubmission) {
                return res.status(404).send();
            }
            if (!canSubmissionReview(req.user) && dbSubmission.submitterId.toString() !== req.user._id.toString()) {
                return res.status(403).send('Not the owner');
            }
            if (dbSubmission.endorsed) {
                return res.status(400).send('Already published.')
            }
            return res.send(await dbPlugins.submission.deleteOneById(dbSubmission._id));
        });
    });

    router.post('/validateSubmissionFile', canSubmissionSubmitMiddleware, (req, res) => {
        return dbPlugins.submission.byId(req.body._id).then(async dbSubmission => {
            if (!dbSubmission) {
                return res.status(404).send();
            }
            if (!dbSubmission.attachmentWorkbook?.fileId) {
                return res.status(400).send('No Workbook');
            }
            return getFile({_id: new ObjectId(dbSubmission.attachmentWorkbook.fileId)}).then(stream => {
                if (!stream) {
                    return res.status(500);
                }
                const emitter = emitters[req.body._id] = new EventEmitter();
                stream.on('data', (data) => {
                    processWorkBook(readXlsx(data), emitter).then(() => {
                        emitters[req.body._id] = null;
                    });
                    emitter.emit('data', res);
                });
            });
        }).catch(respondError({req, res}));
    });

    router.post('/validateSubmissionFileUpdate', canSubmissionSubmitMiddleware, (req, res) => {
        const emitter = emitters[req.body._id];
        if (!emitter) {
            return res.status(404).send();
        }
        emitter.emit('data', res);
    });

    router.post('/submit', canSubmissionSubmitMiddleware, (req, res): Promise<Response> => {
        return dbPlugins.submission.byId(req.body._id).then(async dbSubmission => {
            if (!dbSubmission) {
                return res.status(404).send();
            }
            if (!canSubmissionReview(req.user) && dbSubmission.submitterId.toString() !== req.user._id.toString()) {
                return res.status(403).send('Not the owner');
            }
            if (dbSubmission.endorsed) {
                return res.status(400).send('Already published.')
            }
            dbSubmission.administrativeStatus = 'NLM Review';
            dbSubmission.dateSubmitted = new Date().toJSON();
            return res.send(await dbPlugins.submission.save(dbSubmission));
        });
    });

    return router;
}
