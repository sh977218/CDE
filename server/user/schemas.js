const mongoose = require('mongoose');
const authorizationShared = require('@std/esm')(module)('../../shared/system/authorizationShared');

let schemas = {};

function deleteEmpty(v) {
    if (v === null || v === '') {
        return;
    }
    return v;
}

const stringType = schemas.stringType = {type: String, set: deleteEmpty};

schemas.userSchema = new mongoose.Schema({
    username: Object.assign({unique: true}, stringType),
    email: stringType,
    password: stringType,
    lastLogin: Date,
    lastViewNotification: Date,
    lockCounter: Number,
    orgAdmin: [stringType],
    orgCurator: [stringType],
    siteAdmin: Boolean,
    quota: Number,
    viewHistory: [stringType],
    formViewHistory: [stringType],
    knownIPs: [stringType],
    roles: [Object.assign({enum: authorizationShared.rolesEnum}, stringType)],
    searchSettings: {
        version: Number,
        defaultSearchView: Object.assign({enum: ["accordion", "table", "summary"]}, stringType),
        lowestRegistrationStatus: stringType,
        tableViewFields: {
            name: {type: Boolean, default: true},
            naming: Boolean,
            questionTexts: Boolean,
            permissibleValues: Boolean,
            pvCodeNames: Boolean,
            nbOfPVs: Boolean,
            uom: Boolean,
            stewardOrg: Boolean,
            usedBy: Boolean,
            registrationStatus: Boolean,
            administrativeStatus: Boolean,
            ids: Boolean,
            identifiers: [stringType],
            source: Boolean,
            updated: Boolean,
            numQuestions: Boolean,
            tinyId: Boolean,
            linkedForms: Boolean
        }
    },
    accessToken: stringType,
    refreshToken: stringType,
    avatarUrl: stringType,
    publishedForms: [{
        name: stringType,
        id: mongoose.Schema.Types.ObjectId
    }]
}, {usePushEach: true});

schemas.userSchema.set('collection', 'users');

module.exports = schemas;