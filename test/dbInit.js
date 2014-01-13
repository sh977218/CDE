db.users.drop();
db.dataelements.drop();
db.orgs.drop();
db.forms.drop();
db.pinningBoards.drop();

var defaultBoard = {
    name: "default"
    , shareStatus: "Private"
    , pins: []
};

db.users.insert({username: 'nlm', password: 'nlm', siteAdmin: true, orgAdmin: ['NLM'], viewHistory: []});
db.users.insert({username: 'cabigAdmin', password: 'pass', orgAdmin: ["caBIG"], quota: 1073741824, viewHistory: []});
db.users.insert({username: 'user1', password: 'pass', quota: 1073741824, viewHistory: []});
db.users.insert({username: 'ctepCurator', password: 'pass', orgCurator: ["CTEP"], quota: 1073741824, viewHistory: []});
db.users.insert({username: 'testuser', password: 'Test123', quota: 1073741824, viewHistory: []});
db.users.insert({username: 'boarduser', password: 'pass', quota: 1073741824, viewHistory: []});
db.users.insert({username: 'historyuser', password: 'pass', quota: 1073741824, viewHistory: []});

