var mongoose = require('mongoose')
    , config = require('./parseConfig')
    , connHelper = require('./connections')
    , CronJob = require('cron').CronJob
;




var cj = new CronJob({
    cronTime: '00 00 4 * * *',
    onTick: function() {

    },
    start: false,
    timeZone: "America/New_York"
});
cj.start();
