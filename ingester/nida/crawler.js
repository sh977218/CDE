var page = require('webpage').create();

page.open('http://cde.drugabuse.gov/', function(status) {
    if(status !== "success") {
        console.log("Cannot connect");
        phantom.exit();
    }
    //page.evaluate(function() {
    //    jQuery(".fieldset-wrapper a");
    //});

    var groupsL2 = page.evaluate(function() {
        var links = document.querySelectorAll('.fieldset-wrapper:first a');
        //var result;
        //for (i = 0; i < list.length; i++) {
        //    pizza.push(list[i].innerText);
        //}
        //return pizza;
        return links.map(function(link) {
            return link.innerText;
        });
    });
    console.log(groupsL2);

    phantom.exit();
});