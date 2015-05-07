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

    var groupsL2 = page.evaluate(function() {
        var results = [];
        var links = document.querySelectorAll(".fieldset-wrapper a");
        for (var i = 0; i<links.length; i++) {
            results.push(links[i].innerText);
        }
        return results;
    });
    console.log(groupsL2.join("\n"));

    phantom.exit();
});