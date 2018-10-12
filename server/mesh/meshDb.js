const mongoose = require('mongoose');
require('../system/mongoose-stringtype')(mongoose);
const Schema = mongoose.Schema;
const StringType = Schema.Types.StringType;

const config = require('../system/parseConfig');
const connHelper = require('../system/connections');
const conn = connHelper.establishConnection(config.database.appData);

let meshClassificationSchema = new Schema({
    flatClassification: StringType,
    eltId: StringType,
    meshDescriptors: [StringType],
    flatTrees: [StringType]
});

const MeshClassification = conn.model('meshClassification', meshClassificationSchema);
exports.MeshClassification = MeshClassification;

exports.byId = (id, callback) => {
    MeshClassification.findById(id, callback);
};
exports.byEltId = (eltId, callback) => {
    MeshClassification.find({eltId: eltId}, callback);
};

exports.byFlatClassification = (flatClassification, callback) => {
    MeshClassification.find({flatClassification: flatClassification}, callback);
};

exports.findAll = callback => {
    MeshClassification.find({}, callback);
};

exports.newMesh = (mesh, callback) => {
    new MeshClassification(mesh).save(callback);
};