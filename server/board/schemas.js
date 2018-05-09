const mongoose = require('mongoose');

const sharedSchemas = require('../system/schemas.js');

var schemas = {};

var pinSchema = new mongoose.Schema({
    name: sharedSchemas.stringType,
    pinnedDate: Date,
    deTinyId: sharedSchemas.stringType,
    deName: sharedSchemas.stringType,
    formTinyId: sharedSchemas.stringType,
    formName: sharedSchemas.stringType
}, {_id: false});

schemas.pinningBoardSchema = new mongoose.Schema({
    elementType: Object.assign({default: 'board'}, sharedSchemas.stringType),
    name: sharedSchemas.stringType,
    description: sharedSchemas.stringType,
    type: Object.assign({default: 'cde', enum: ['cde', 'form']}, sharedSchemas.stringType),
    tags: [sharedSchemas.stringType],
    shareStatus: sharedSchemas.stringType,
    createdDate: Date,
    updatedDate: Date,
    owner: {
        userId: mongoose.Schema.Types.ObjectId,
        username: sharedSchemas.stringType
    },
    pins: [pinSchema],
    users: [{
        username: sharedSchemas.stringType,
        role: Object.assign({default: 'viewer', enum: ['viewer', 'reviewer']}, sharedSchemas.stringType),
        lastViewed: Date,
        status: {
            approval: Object.assign({
                default: 'invited',
                enum: ['invited', 'approved', 'disapproved']
            }, sharedSchemas.stringType),
            reviewedDate: Date
        }
    }],
    review: {
        startDate: Date,
        endDate: Date
    }
}, {usePushEach: true});
schemas.pinningBoardSchema.set('collection', 'pinningBoards');

module.exports = schemas;

