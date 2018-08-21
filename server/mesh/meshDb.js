const Schema = require('mongoose').Schema;
const stringType = require('../system/schemas').stringType;
const config = require('../system/parseConfig');
const connHelper = require('../system/connections');
const conn = connHelper.establishConnection(config.database.appData);


let meshClassificationSchema = new Schema({
    flatClassification: stringType,
    eltId: stringType,
    meshDescriptors: [stringType],
    flatTrees: [stringType]
});

const MeshClassification = conn.model('meshClassification', meshClassificationSchema);
exports.MeshClassification = MeshClassification;

exports.byId = (id, callback) => {
    MeshClassification.findOne(id, callback);
};
exports.byEltId = (eltId, callback) => {
    MeshClassification.findById({eltId: eltId}, callback);
};

exports.byFlatClassification = (flatClassification, callback) => {
    MeshClassification.find({flatClassification: flatClassification}, callback);
};

exports.findAll = callback => {
    MeshClassification.find({}, callback)
};

exports.newMesh = (mesh, callback) => {
    new MeshClassification(mesh).save(callback);
};