// Unzip both promis and neuro under English Folder /Promis Instruments
// and /Neuro-QOL Measures
// 2) Reads the PDF folder and creates classifications mapping
// node ingester/promis/getClassifs.js ../promis/pdfForms/English

var fs = require('fs');
var formPath = process.argv[2];
var formNameMap = {};

var readDir = function (path) {
    var dirContent = fs.readdirSync(formPath + "/" + path.join("/"));
    dirContent.forEach(function (element) {
        if (element.substr(element.length - 4) === ".pdf") {
            var formName = element.substr(0, element.length - 4);

            // remove date expected to be at end of file name
            formName = element.substr(0, formName.lastIndexOf(" "));

            if (formName.indexOf("_") > -1) formName = formName.substr(0, formName.length - 11);
            formNameMap[formName] = path;
        } else {
            var pCopy = JSON.parse(JSON.stringify(path));
            pCopy.push(element);
            readDir(pCopy);
        }
    });
};

readDir([]);
fs.writeFileSync(formPath + "/../../formMap.json", JSON.stringify(formNameMap));
console.log("Loaded...");


