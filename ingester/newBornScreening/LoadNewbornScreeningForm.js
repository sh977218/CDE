require('../loinc/Form/ReloadLoincFormByOrg').reloadLoincFormsByOrg('Newborn Screening',function(){
    console.log("Done everything.");
    process.exit(1);
});