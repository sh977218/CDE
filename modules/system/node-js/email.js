var nodemailer = require('nodemailer');
    
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'nlmcdeapp@gmail.com',
        pass: 'MeanPowered'
    }
});    

var mailOptions = {
    from: 'NLM CDE APP <nlmcdeapp@gmail.com>', 
    to: 'jakub.flaska@nih.gov', 
    subject: 'URGENT: Production Server Problems', 
    text: null
};

exports.send = function(msg) {
    mailOptions.text = msg;
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Message sent: ' + info.response);
        }
    });     
};