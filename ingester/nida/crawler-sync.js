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
    p.onResourceRequested = function (request) {
        //console.log('Request ' + JSON.stringify(request, undefined, 4));
    };
};

setPage(page);

page.open('http://cde.drugabuse.gov/instruments', function(status) {
    if(status !== "success") {
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

    var cdes = [];
    var moduleGroups = page.evaluate(findChildrenLinks, "fieldset:nth-of-type(1) a");
    var allModules = [];

    var processCdeList = function() {
        var fileContent = "";
        cdes.forEach(function(line){
            fileContent += line.id + ","+line.moduleGroup+","+line.module+"\n";
        });
        fs.write("./cdes.csv", fileContent, 'w');
        phantom.exit();
    };

    var processModule = function(index) {
        var module = allModules[index];
        console.log("Opening 2nd level: " + module.name);

        var modulePage = webpage.create();
        setPage(modulePage);
        modulePage.open(module.url, function(status){
            console.log("Opened 2nd level: " + module.moduleGroup + " > " + module.name);
            if (status !== "success") {
                console.log("\n\nERROR Loading "+module.name+"\n\n");
            }
            modulePage.render("screenshots/"+module.moduleGroup+module.name+'.png');
            var ids = modulePage.evaluate(findChildrenLinks, "td:nth-child(2) a");
            ids.forEach(function(id, i){
                cdes.push({
                    id: ids[i].name
                    , module: module.name
                    , moduleGroup: module.moduleGroup
                });
            });
            if (allModules[index+1]) processModule(index+1);
            else processCdeList();
            modulePage.close();
        });

    };

    var processModuleGroup = function (index) {
        var moduleGroup = moduleGroups[index];
        var subPage = webpage.create();
        setPage(subPage);
        console.log("Opening 1st level: " + moduleGroup.name);
        subPage.open(moduleGroup.url, function(status) {
            console.log("Opened 1st level: " + moduleGroup.name);
            if (status !== "success") {
                console.log("\n\nERROR Loading "+moduleGroup.name+"\n\n");
            }
            subPage.render("screenshots/"+moduleGroup.name+'.png');
            var modules = subPage.evaluate(findChildrenLinks, "div.content > table.tableheader-processed td a");
            modules = modules.map(function(m){
                m.moduleGroup = moduleGroup.name;
                return m;
            });
            allModules = allModules.concat(modules);
            subPage.close();
            if (moduleGroups[index+1]) processModuleGroup(index+1);
            else processModule(0);
        });
    };
    processModuleGroup(0);

    //moduleGroups.forEach(function(moduleGroup) {
    //    var subPage = webpage.create();
    //    setPage(subPage);
    //    console.log("Opening 1st level: " + moduleGroup.name);
    //    subPage.open(moduleGroup.url, function(status) {
    //        console.log("Opened 1st level: " + moduleGroup.name);
    //        if (status !== "success") {
    //            console.log("\n\nERROR Loading "+moduleGroup.name+"\n\n");
    //        }
    //        subPage.render("screenshots/"+moduleGroup.name+'.png');
    //        var modules = subPage.evaluate(findChildrenLinks, "div.content > table.tableheader-processed td a");
    //        modules.forEach(function(module){
    //            console.log("Opening 2nd level: " + moduleGroup.name + " > " + module.name);
    //            var modulePage = webpage.create();
    //            setPage(modulePage);
    //            modulePage.open(module.url, function(status){
    //                console.log("Opened 2nd level: " + moduleGroup.name + " > " + module.name);
    //                if (status !== "success") {
    //                    console.log("\n\nERROR Loading "+module.name+"\n\n");
    //                }
    //                modulePage.render("screenshots/"+moduleGroup.name+module.name+'.png');
    //                var ids = modulePage.evaluate(findChildrenLinks, "td:nth-child(2) a");
    //                ids.forEach(function(id, i){
    //                    cdes.push({
    //                        id: ids[i].name
    //                        , module: module.name
    //                        , moduleGroup: moduleGroup.name
    //                    });
    //                    //console.log(ids[i].name + ","+moduleGroup.name+","+module.name);
    //                });
    //            });
    //            //modulePage.close();
    //        });
    //    });
    //    //subPage.close();
    //});
    //setTimeout(function(){
    //    var fileContent = "";
    //    cdes.forEach(function(line){
    //        fileContent += line.id + ","+line.moduleGroup+","+line.module+"\n";
    //    });
    //    fs.write("./cdes.csv", fileContent, 'w');
    //}, 20000)
});