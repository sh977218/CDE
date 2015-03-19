var nodemailer = require('nodemailer')
    , config = require('config')
    , mongo_data_system = require('./mongo-data')
    , logging = require('../../system/node-js/logging');
    
var transporter = nodemailer.createTransport();    

var mailOptions = {
    from: config.account
    , to: ''
    , subject: 'URGENT: The CDE APP  ' + config.name
    , text: null
};

exports.passToTransporter = function(mailOptions, cb){
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            logging.errorLogger.error("Error: Cannot send email", {origin: "system.email.send", stack: new Error().stack, details: "mailOptions "+JSON.stringify(mailOptions)+", error "+error+", info"+info});
        }else{
            console.log('Message sent: ' + info.response);
        }
        if (cb) cb(error);
    });       
};

exports.assembleRecipient = function(users) {
    return users.filter(function(a){return typeof(a.email)!=="undefined";}).map(function(a) {return a.email;}).join(",");
};

exports.emailUsers = function(msg, users, cb) {
    mailOptions.to = exports.assembleRecipient(users);
    mailOptions.text = msg.body;
    if (msg.subject) mailOptions.subject = msg.subject;
    exports.passToTransporter(mailOptions, cb);
};

