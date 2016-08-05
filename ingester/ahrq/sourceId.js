var ahrqCdes = db.getCollection('dataelements').find({"source":"AHRQ"});
ahrqCdes.forEach(function(cde){
    var id = cde.sourceId;
    cde.ids.push({id: id, source: "AHRQ"})
    delete cde.sourceId;
    db.dataelements.update({tinyId: cde.tinyId}, cde);
});