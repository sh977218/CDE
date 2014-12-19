var nodemailer = require('nodemailer')
    , config = require('config')
    , mongo_data_system = require('./mongo-data');
    
var transporter = nodemailer.createTransport();    

var mailOptions = {
    from: config.account
    , to: ''
    , subject: 'URGENT: Server Problems on ' + config.name
    , text: null
};

exports.send = function(msg, cb) {
    mongo_data_system.siteadmins(function(err, users) {
        mailOptions.to = users.filter(function(a){return typeof(a.email)!=="undefined";}).map(function(a) {return a.email;}).join(",");
        mailOptions.text = msg;
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
            }else{
                console.log('Message sent: ' + info.response);
            }
            if (cb) cb(error);
        });     
    });
};