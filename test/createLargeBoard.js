var user = db.users.find({"username":"ninds"}).next();
var newBoard = {
    "name" : "Large Board"
    , "shareStatus" : "Private"
    , "owner" : {
        "userId" : user._id,
        "username" : "ninds"
    }
    , "pins" : []
};

var des = db.dataelements.find({}).sort({"naming.designation":1});


des.forEach(function(de) {
    newBoard.pins.push({
        "deUuid" : de.uuid,
        "_id" : de._id     
    });
});

db.pinningBoards.insert(newBoard);