// usage: phantomjs ingester/nida/crawler.js, node ingester/nida/wiper.js, node ingester/nida/loader.js

var webpage = require('webpage')
    , system = require('system')
    , fs = require('fs')
    ;

var page = webpage.create();

var setPage = function (p) {
    p.settings.resourceTimeout = 5000;
    p.onConsoleMessage = function (msg) {
        system.stderr.writeLine('console: ' + msg);
    };
    p.onResourceTimeout = function () {
        console.log("\n\nResource Timeout\n\n");
    };
};

setPage(page);

var saveFile = function(content){
    fs.write("./nida-forms.csv", content, 'a');
};

var loadDone = function(){
    fs.write("./nida-forms.csv", "]", 'a');
    phantom.exit();
};

fs.remove("./nida-forms.csv");
fs.write("./nida-forms.csv", "[", 'a');

page.open('http://cde.drugabuse.gov/instruments', function(status) {

    if(status !== "success") {
        console.log("Cannot connect");

    }
    var findChildrenLinks = function (linksSelector) {
        var results = [];
        var links = document.querySelectorAll(linksSelector);
        for (var i = 0; i < links.length; i++) {
            results.push({name: links[i].innerText, url: links[i].href});
        }
        return results;
    };

    var formsCR = page.evaluate(findChildrenLinks, "fieldset:nth-of-type(1) a");

    var forms = formsCR;

    var getForm = function (index) {
        console.log("Loading form " + index);
        var nidaForm = forms[index];
        var subPage = webpage.create();
        setPage(subPage);
        console.log("Opening 1st level: " + nidaForm.name);
        subPage.open(nidaForm.url, function(status) {
            console.log("Opened 1st level: " + nidaForm.name);
            if (status !== "success") {
                console.log("\n\nERROR Loading "+nidaForm.name+"\n\n");
            }
            var sections = subPage.evaluate(findChildrenLinks, "div.content > table.tableheader-processed td a");

            var cdeForm = {name: nidaForm.name, sections: []};

            sections.forEach(function(s){
                cdeForm.sections.push({
                    name: s.name
                });
            });
            saveFile(JSON.stringify(cdeForm) + (forms[index+1]?",":"") +"\n");
            subPage.close();
            if (forms[index+1]) getForm(index+1);
            else loadDone();
        });
    };

    getForm(0);

});