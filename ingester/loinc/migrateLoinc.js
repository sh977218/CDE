//This scripts converts Loinc collection from LoadFromLoincSite into a data element collection

var MigrationLoincModal = require('../createMigrationConnection').MigrationLoincModal
    , MigrationDataElementModel = require('../createMigrationConnection').MigrationDataElementModel
    ;

MigrationLoincModal.find({info: {$not:/^no loinc name/i}}).stream().on('data', function(cde){ // let's skip the CDEs which are not on the website
    var newCde = new MigrationDataElementModel();
    newCde.naming = [{designation: cde._doc['LOINC NAME'], definition: ""}];
    newCde.save();
});
