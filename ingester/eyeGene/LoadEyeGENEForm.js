require('../loinc/Form/ReloadLoincFormByOrg').reloadLoincFormsByOrg('eyeGENE',function(){
    console.log("Done everything.");
    process.exit(1);
});