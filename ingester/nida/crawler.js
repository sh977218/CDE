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

page.open('http://cde.drugabuse.gov/instruments', function (status) {
    if (status !== "success") {
        console.log("Cannot connect");
        phantom.exit();
    }

    var findChildrenLinks = function (linksSelector) {
        var results = [];
        var links = document.querySelectorAll(linksSelector);
        for (var i = 0; i < links.length; i++) {
            results.push({name: links[i].innerText, url: links[i].href});
        }
        return results;
    };

    var moduleGroupsCR = page.evaluate(findChildrenLinks, "fieldset:nth-of-type(1) a");
    var moduleGroupsEHR = page.evaluate(findChildrenLinks, "fieldset:nth-of-type(2) a");

    var processCdeList = function () {
        cdes.forEach(function (line) {
            fileContent += line.id + "," + topLevel + "," + line.moduleGroup + "," + line.module + "\n";
        });
    };

    var endOfCdeList1 = function () {
        endOfCdeList = endOfCdeList2;
        moduleGroups = moduleGroupsEHR;
        topLevel = "Electronic Health Records";
        allModules = [];
        cdes = [];
        processModuleGroup(0);
    };

    var endOfCdeList2 = function () {
        fs.write("./nida-cdes.csv", fileContent, 'w');
        phantom.exit();
    };

    var processModule = function (index) {
        var module = allModules[index];
        console.log("Opening 2nd level: " + module.name);

        var modulePage = webpage.create();
        setPage(modulePage);
        modulePage.open(module.url, function (status) {
            console.log("Opened 2nd level: " + module.moduleGroup + " > " + module.name);
            if (status !== "success") {
                console.log("\n\nERROR Loading " + module.name + "\n\n");
            }
            var ids = modulePage.evaluate(findChildrenLinks, "td:nth-child(2) a");
            ids.forEach(function (id, i) {
                cdes.push({
                    id: ids[i].name
                    , module: module.name
                    , moduleGroup: module.moduleGroup
                });
            });
            if (allModules[index + 1]) processModule(index + 1);
            else {
                processCdeList();
                endOfCdeList();
            }
            modulePage.close();
        });

    };

    var processModuleGroup = function (index) {
        var moduleGroup = moduleGroups[index];
        var subPage = webpage.create();
        setPage(subPage);
        console.log("Opening 1st level: " + moduleGroup.name);
        subPage.open(moduleGroup.url, function (status) {
            console.log("Opened 1st level: " + moduleGroup.name);
            if (status !== "success") {
                console.log("\n\nERROR Loading " + moduleGroup.name + "\n\n");
            }
            var modules = subPage.evaluate(findChildrenLinks, "div.content > table.tableheader-processed td a");
            modules = modules.map(function (m) {
                m.moduleGroup = moduleGroup.name;
                return m;
            });
            allModules = allModules.concat(modules);
            subPage.close();
            if (moduleGroups[index + 1]) processModuleGroup(index + 1);
            else processModule(0);
        });
    };
    var fileContent = "";
    var moduleGroups = moduleGroupsCR;
    var topLevel = "Clinical Research";
    var allModules = [];
    var cdes = [];
    var endOfCdeList = endOfCdeList1;
    processModuleGroup(0);
});