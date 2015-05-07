var page = require('webpage').create()
    , system = require('system');

page.onConsoleMessage = function(msg) {
    system.stderr.writeLine( 'console: ' + msg );
};

page.open('http://cde.drugabuse.gov/instruments', function(status) {
    if(status !== "success") {
        console.log("Cannot connect");
        phantom.exit();
    }

    var findChildrenLinks = function(linksSelector) {
        var sel = linksSelector;
        return function () {
            var results = [];
            var links = document.querySelectorAll(sel);
            for (var i = 0; i < links.length; i++) {
                results.push({name: links[i].innerText, url: links[i].href});
            }
            return results;
        }
    };

    var groupsL2 = page.evaluate(findChildrenLinks("fieldset:nth-of-type(1) a"));
    console.log(groupsL2.map(function(e) {return e.name+":"+e.url}).join("\n"));

    phantom.exit();
});