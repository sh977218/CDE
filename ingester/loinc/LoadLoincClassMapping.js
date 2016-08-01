var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream('./ingester/loinc/Classes Mapping')
});

var MigrationLoincClassMappingModel = require('./../createConnection').MigrationLoincClassificationMappingModel;

var num = 0;
var allTypes = ['Clinical Term Class', 'Laboratory Term Class', 'Attachment Term Class', 'Survey Term Class'];
var header = true;
var map = {};

function run() {
    lineReader.on('line', function (line) {
            line = line.trim();
            // Table
            if (line.indexOf('Table 32') !== -1) {
                header = true;
            }
            // Th
            else if (line === 'Abbreviation') {
                header = true;
            }
            // Th
            else if (allTypes.indexOf(line) !== -1) {
                header = false;
                map.type = line;
            }
            // Td
            else if (line.length === 0) {
            }
            else {
                if (num % 2 == 0) {
                    map.key = line;
                } else {
                    map.value = line;
                    var obj = new MigrationLoincClassMappingModel(map);
                    obj.save(function (err, o) {
                        if (err) throw err;
                    })
                }
                num++;
            }
            console.log('Line from file:', line);
        }
    );
}


run();