require('../loinc/Form/ReloadLoincFormByOrg').reloadLoincFormsByOrg('Office of the National Coordinator',function(){
    console.log("Done everything.");
    process.exit(1);
});