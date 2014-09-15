var nodemailer = require('nodemailer')
    , config = require('config')
    , mongo_data_system = require('./mongo-data');
    
var transporter = nodemailer.createTransport({
    service: 'Gmail'
    , auth: {
        user: 'nlmcdeapp@gmail.com'
        , pass: 'MeanPowered'
    }
});    

var admins = [];

mongo_data_system.siteadmins(function(err, users) {
    admins = users;
});

var mailOptions = {
    from: 'NLM CDE APP <nlmcdeapp@gmail.com>'
    , to: admins.map(function(a) {return a.email;}).join(",")
    , subject: 'URGENT: Production Server Problems'
    , text: null
};

exports.send = function(msg, cb) {
    mailOptions.text = msg;
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Message sent: ' + info.response);
        }
        if (cb) cb(error);
    });     
};