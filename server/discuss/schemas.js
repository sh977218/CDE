const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let schemas = {};

function deleteEmpty(v) {
    if (v === null || v === '') {
        return;
    }
    return v;
}

const stringType = schemas.stringType = {type: String, set: deleteEmpty};

schemas.commentSchema = new mongoose.Schema({
    text: stringType,
    user: stringType,
    username: stringType,
    userBk: {
        userId: Schema.Types.ObjectId,
        username: stringType
    },
    created: Date,
    pendingApproval: Boolean,
    linkedTab: stringType,
    status: Object.assign({enum: ["active", "resolved", "deleted"], default: "active"}, stringType),
    replies: [{
        text: stringType,
        user: stringType,
        username: stringType,
        userBk: {
            userId: Schema.Types.ObjectId,
            username: stringType
        },
        created: Date,
        pendingApproval: Boolean,
        status: Object.assign({enum: ["active", "resolved", "deleted"], default: "active"}, stringType)
    }],
    element: {
        eltType: Object.assign({enum: ["cde", "form", "board"]}, stringType),
        eltId: stringType
    }
}, {usePushEach: true,});

module.exports = schemas;