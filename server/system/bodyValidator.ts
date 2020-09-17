import { RequestHandler } from 'express';
const { validationResult } = require('express-validator');

export const validateBody: RequestHandler = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).send({errors: errors.array()});
    }
    next();
};
