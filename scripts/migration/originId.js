cursor = db.dataelements.find();
while ( cursor.hasNext() ) {
   var thisDe = cursor.next();
   if (thisDe.originId !== undefined) {
        var splitId = thisDe.originId.split('v');
        db.dataelements.updateOne({_id: thisDe._id}, {$set: {ids: [{origin: thisDe.origin, id: splitId[0], version: splitId[1]}]}});
   }
}