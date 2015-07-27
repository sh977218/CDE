var request = require('request');
var parseString = require('xml2js').parseString;

var formIncrement = 20;

var formListUrl = "http://cadsrapi.nci.nih.gov/cadsrapi41/GetXML?query=Form&Form[@workflowStatusName=RELEASED]&resultCounter=" + formIncrement + "&startIndex=";

var getFormPageUrl = function(page){
    return formListUrl + (page * formIncrement);
};

var getForms = function(page){
    var forms = [];
    var url = getFormPageUrl(page);
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            parseString(body, function (err, result) {

                result["xlink:httpQuery"].queryResponse[0].class.forEach(function(cadsrForm){
                    var form = {};
                    cadsrForm.field.forEach(function(f){
                        form[f.$.name] = f._;
                    });

                    forms.push(form);
                });

            });
            console.log(JSON.stringify(forms));
        }
    });
};

getForms(0);