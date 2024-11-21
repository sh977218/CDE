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

var outputFileName = "./nida-forms.json";

setPage(page);

var saveFile = function (content) {
    fs.write(outputFileName, content, 'a');
};

var loadDone = function () {
    fs.write(outputFileName, "]", 'a');
    phantom.exit();
};

fs.remove(outputFileName);
fs.write(outputFileName, "[", 'a');

page.open('http://cde.drugabuse.gov/instruments', function (status) {

    if (status !== "success") {
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

    var getTextContent = function (selector) {
        return document.querySelector(selector).innerHTML;
    };

    var forms = page.evaluate(findChildrenLinks, "fieldset:nth-of-type(1) a");
    //var forms = page.evaluate(findChildrenLinks, "fieldset:nth-of-type(2) a");
    var classif = "Clinical Research";
    //var classif = "Electronic Health Records";
    console.log("Total nr. of forms: " + forms.length);


    var getForm = function (index) {
        console.log("Loading form " + index);
        var nidaForm = forms[index];
        var subPage = webpage.create();
        setPage(subPage);
        subPage.open(nidaForm.url, function (status) {
            if (status !== "success") {
                console.log("\n\nERROR Loading " + nidaForm.name + "\n\n");
            }
            var sections = subPage.evaluate(findChildrenLinks, "div.content > table.tableheader-processed td a");
            var pdfForm = subPage.evaluate(findChildrenLinks, ".file a");
            var v;
            if (pdfForm[0]) v = pdfForm[0].name.split(/(-|_)/).filter(function (s, i) {
                return s.length > 1 && i !== 0;
            }).join(" ");
            if (v) v = v.replace(".pdf", "");
            var desc = subPage.evaluate(getTextContent, ".field-name-field-description .field-item");
            var cdeForm = {name: nidaForm.name, sections: [], classification: [classif], description: desc};
            if (v) cdeForm.version = v;
            var getSection = function (i) {
                var s = sections[i];
                var sectionPage = webpage.create();
                sectionPage.open(s.url, function (status) {
                    if (status !== "success") throw "cannot load url" + s.url;
                    var ids = sectionPage.evaluate(findChildrenLinks, "td:nth-child(2) a");
                    var labels = sectionPage.evaluate(findChildrenLinks, "td:nth-child(1) a");
                    var newSection = {name: s.name, questions: []};
                    ids.forEach(function (id, ind) {
                        newSection.questions.push({id: id.name, label: labels[ind].name});
                    });
                    cdeForm.sections.push(newSection);
                    sectionPage.close();
                    if (sections[i + 1]) {
                        getSection(i + 1);
                    } else {
                        saveFile(JSON.stringify(cdeForm) + (forms[index + 1] ? "," : "") + "\n");
                        console.log("Saving form: " + cdeForm.name);
                        subPage.close();
                        if (forms[index + 1] && forms[index + 1].name.indexOf('PROMIS') == -1) getForm(index + 1);
                        else loadDone();
                    }

                });
            };
            getSection(0);
        });
    };

    getForm(0);

});