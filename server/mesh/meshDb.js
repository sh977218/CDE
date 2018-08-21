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

exports.findMeshClassification = (query, callback) => {
    MeshClassification.find(query, callback);
};