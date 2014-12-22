db.users.remove({});
db.dataelements.remove({});
db.orgs.remove({});
db.forms.remove({});
db.pinningBoards.remove({});
db.messages.remove({});
db.sessions.remove({});
db.articles.remove({});

var defaultBoard = {
    name: "default"
    , shareStatus: "Private"
    , pins: []
};

//db.orgs.insert({name: "NINDS-WG-1", workingGroupOf: "NINDS", classifications: [{name: "WG1 Classif", elements: [{name: "WG1 Sub Classif"}]}]});
//db.orgs.insert({name: "NINDS-WG-2", workingGroupOf: "NINDS", classifications: [{name: "WG2 Classif", elements: [{name: "WG2 Sub Classif"}]}]});

db.articles.insert({key: "testAdminCanEdit", body: "Admin can edit this."});
db.articles.insert({key: "testEdits", body: "Testing edits"});
