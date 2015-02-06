var nodemailer = require('nodemailer')
    , config = require('config')
    , mongo_data_system = require('./mongo-data')
    , logging = require('../../system/node-js/logging');
    
var transporter = nodemailer.createTransport();    

var mailOptions = {
    from: config.account
    , to: ''
    , subject: 'URGENT: Server Problems on ' + config.name
    , text: null
};

exports.send = function(msg, cb) {
    mongo_data_system.siteadmins(function(err, users) {
        if (err || !Array.isArray(users) || users.length <= 0) return logging.errorLogger.error("Error: Email cannot obtain list of site admins.", {origin: "system.email.send", stack: new Error().stack, details: "err "+err+", users "+users});
        mailOptions.to = users.filter(function(a){return typeof(a.email)!=="undefined";}).map(function(a) {return a.email;}).join(",");
        mailOptions.text = msg;
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                logging.errorLogger.error("Error: Cannot send email", {origin: "system.email.send", stack: new Error().stack, details: "mailOptions "+JSON.stringify(mailOptions)+", error "+error+", info"+info});
            }else{
                console.log('Message sent: ' + info.response);
            }
            if (cb) cb(error);
        });     
    });
};