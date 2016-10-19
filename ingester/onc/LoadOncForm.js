require('../loinc/Form/ReloadLoincFormByOrg').reloadLoincFormsByOrg('ONC',function(){
    console.log("Done everything.");
    process.exit(1);
});