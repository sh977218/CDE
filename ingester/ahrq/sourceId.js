var ahrqCdes = db.getCollection('dataelements').find({"source": "AHRQ"});
ahrqCdes.forEach(function (cde) {
    var id;
    if (cde.sourceId) cde.sourceId.split("v")[0];
    var v;
    if (cde.sourceId) cde.sourceId.split("v")[1];
    cde.ids.push({id: id, source: "AHRQ", version: v});
    delete cde.sourceId;
    db.dataelements.updateOne({tinyId: cde.tinyId}, cde);
});
