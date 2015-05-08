var webpage = require('webpage')
    , system = require('system')
    , mongo_cde = require('../modules/cde/node-js/mongo-cde')
    , config = require('config')
    , classificationShared = require('../modules/system/shared/classificationShared')
    , mongo_data_system = require('../modules/system/node-js/mongo-data')
    ;

var page = webpage.create();

page.onConsoleMessage = function(msg) {
    system.stderr.writeLine( 'console: ' + msg );
};

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

    var cdes = [{}];

    var processCde = function(cde){
        mongo_cde.byOtherId("", "", )
    };

    var moduleGroups = page.evaluate(findChildrenLinks, "fieldset:nth-of-type(1) a");
    moduleGroups.forEach(function(moduleGroup) {
        var subPage = webpage.create();
        subPage.open(moduleGroup.url, function(status) {
            var modules = subPage.evaluate(findChildrenLinks, "div.content > table.tableheader-processed td a");
            modules.forEach(function(module){
                var modulePage = webpage.create();
                modulePage.open(module.url, function(status){
                    //var cdes = modulePage.evaluate(findChildrenLinks, "td:nth-child(1) a");
                    var ids = modulePage.evaluate(findChildrenLinks, "td:nth-child(2) a");
                    ids.forEach(function(id, i){
                        //console.log(moduleGroup.name+" > "+module.name + " > " + cdes[i].name + " : " + ids[i].name +"\n\n");
                        processCde({
                            id: ids[i].name
                            , module: module.name
                            , moduleGroup: moduleGroup.name
                        });
                    });
                });
            });
        });
    });
});