var fs = require('fs');
var formPath = process.argv[2];
var levelOneClassifs = fs.readdirSync(formPath);

var formNameMap = {};

levelOneClassifs.forEach(function (l1) {
    var levelTwoClassifs = fs.readdirSync(formPath + "/" +l1);
    levelTwoClassifs.forEach(function(l2){
        if (l2.substr(l2.length - 4) === ".pdf") {
            //console.log(formPath + "/" + l1 + "/" + l2);
            formNameMap[l2.substr(0, l2.length - 4)] = [l1];
        }
        else {
            var levelThreeClassifs = fs.readdirSync(formPath + "/" + l1 + "/" + l2);
            levelThreeClassifs.forEach(function(l3){
                //console.log(formPath + "/" + l1 + "/" + l2 + "/" + l3);
                formNameMap[l3.substr(0, l3.length - 4)] = [l1, l2];
            });
        }
    });
});

console.log(JSON.stringify(formNameMap));

