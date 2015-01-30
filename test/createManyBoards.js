var nrBoards = 49;

var boardSchema = {
    "name" : "Bot Board",
    "description" : "A board of a spammer.",
    "shareStatus" : "Private",
    "pins" : [],
    "owner" : {
        "userId" : null,
        "username" : "boardBot"
    },
    "__v" : 0
};

boardSchema.owner.userId = db.users.findOne({username: 'boardBot'})._id;

for (var i = 0; i < nrBoards; i++){
    db.pinningBoards.insert(boardSchema);
}