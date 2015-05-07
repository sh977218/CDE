var webpage = require('webpage')
    , system = require('system');

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

    var instruments = page.evaluate(findChildrenLinks, "fieldset:nth-of-type(1) a");
    instruments.forEach(function(instrument) {
        var subPage = webpage.create();
        subPage.open(instrument.url, function(status) {
            var modules = subPage.evaluate(findChildrenLinks, "div.content > table.tableheader-processed td a");
            modules.forEach(function(module){
                var modulePage = webpage.create();
                modulePage.open(module.url, function(status){
                    var cdes = modulePage.evaluate(findChildrenLinks, "td:nth-child(1) a");
                    var ids = modulePage.evaluate(findChildrenLinks, "td:nth-child(2) a");
                    cdes.forEach(function(cde, i){
                        console.log(instrument.name+" > "+module.name + " > " + cde.name + " : " + ids[i].name +"\n\n");
                    });

                    //ids.forEach(function(cde, i){
                    //    console.log("id id id");
                    //    console.log("id: "+instrument.name+" > "+module.name + " > " + cde.name + " > " /*+ ids[i].name*/ +"\n\n");
                    //});

                    //var rows = modulePage.evaluate(function(){
                    //    var rows = document.querySelectorAll("tr");
                    //    var result = [];
                    //    for (var i = 0; i < rows.length; i++) result.push({
                    //        name: jQuery(rows[i]).find("td:nth-child(1) a").text()
                    //        , id: jQuery(rows[i]).find("td:nth-child(2) a").text()//jQuery(rows[i]).html()
                    //    });
                    //    return result;
                    //});
                    //for (var i = 0; i < rows.length; i ++) {
                    //    console.log(instrument.name+" > "+module.name + " > " + rows[i].name + " : " + rows[i].id);
                    //    //console.log(rows[i].name);
                    //}
                });
            });
        });
    });
});