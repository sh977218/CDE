var mongoose = require('mongoose')
    , config = require('./parseConfig')
    , connHelper = require('./connections')
    , CronJob = require('cron').CronJob
;

var mongoLogUri = config.database.log.uri || 'mongodb://localhost/cde-logs';

var riverSchema = new mongoose.Schema({
    from: String,
    to: String,
    latestId: ObjectId,
    skippedId: ObjectId
});

var connection = connHelper.establihConnection(mongoLogUri);
var River = connection.model('river', riverSchema);

var cj = new CronJob({
    cronTime: '00 00 4 * * *',
    onTick: function() {

    },
    start: false,
    timeZone: "America/New_York"
});
cj.start();
