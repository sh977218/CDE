const config = require('../system/parseConfig');
const mongoose = require('mongoose');
require('../system/mongoose-stringtype')(mongoose);
const Schema = mongoose.Schema;
const StringType = Schema.Types.StringType;

const connHelper = require('../system/connections');
const conn = connHelper.establishConnection(config.database.appData);

exports.fs_files = new Schema({
    _id: Schema.Types.ObjectId,
    filename: StringType,
    contentType: StringType,
    length: Number,
    chunkSize: Number,
    uploadDate: Date,
    aliases: StringType,
    metadata: {
        status: StringType
    },
    md5: StringType
});
exports.fs_files.set('collection', 'fs.files');
exports.Fs_files = conn.model('fs_files', exports.fs_files);

exports.alterAttachmentStatus = function (id, status, callback) {
    exports.Fs_files.updateOne({_id: id}, {$set: {'metadata.status': status}}, callback);
};
