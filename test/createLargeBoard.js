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

var des = db.dataelements.find({}).sort({"tinyId":1});


des.forEach(function(de) {
    newBoard.pins.push({
        "deTinyId" : de.tinyId,
        "_id" : de._id     
    });
});

db.pinningBoards.insert(newBoard);