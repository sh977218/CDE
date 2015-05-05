db.users.remove({});
db.dataelements.remove({});
db.orgs.remove({});
db.forms.remove({});
db.pinningBoards.remove({});
db.messages.remove({});
db.sessions.remove({});
db.articles.remove({});
db.fs.files.remove({});
db.fs.chunks.remove({});

var defaultBoard = {
    name: "default"
    , shareStatus: "Private"
    , pins: []
};

//db.users.insert({username: 'nlm', password: 'nlm', siteAdmin: true, orgAdmin: ["caBIG","CTEP","NINDS","ACRIN","PS&CC"], viewHistory: [], email: "admin@email.com"});
//db.users.insert({username: 'cabigAdmin', password: 'pass', orgAdmin: ["caBIG"], quota: 1073741824, viewHistory: []});
//db.users.insert({username: 'userToPromote', password: 'pass', quota: 1073741824, viewHistory: []});
//db.users.insert({username: 'reguser', password: 'pass', quota: 1073741824, viewHistory: []});
//db.users.insert({username: 'ctepCurator', password: 'pass', orgCurator: ["CTEP"], quota: 1073741824, viewHistory: []});
//db.users.insert({username: 'createUser', password: 'pass', orgCurator: ["CTEP"], quota: 1073741824, viewHistory: []});
//db.users.insert({username: 'testuser', password: 'Test123', quota: 1073741824, viewHistory: [], email: "test@example.com", roles: ["BoardPublisher", "CommentAuthor"]});
//db.users.insert({username: 'boarduser', password: 'pass', quota: 1073741824, viewHistory: [], roles: ["BoardPublisher"]});
//db.users.insert({username: 'boarduser1', password: 'pass', quota: 1073741824, viewHistory: [], roles: ["BoardPublisher"]});
//db.users.insert({username: 'boardsearchuser', password: 'pass', quota: 1073741824, viewHistory: [], roles: ["BoardPublisher"]});
//db.users.insert({username: 'boarduser2', password: 'pass', quota: 1073741824, viewHistory: [], roles: ["BoardPublisher"]});
//db.users.insert({username: 'pinuser', password: 'pass', quota: 1073741824, viewHistory: []});
//db.users.insert({username: 'boarduserEdit', password: 'pass', quota: 1073741824, viewHistory: []});
//db.users.insert({username: 'historyuser', password: 'pass', quota: 1073741824, viewHistory: []});
//db.users.insert({username: 'appScan', password: 'I@mA88Scan', quota: 1073741824, viewHistory: []});
//db.users.insert({username: 'classMgtUser', password: 'pass', orgCurator: ["CTEP","NINDS"], orgAdmin: ["caBIG"], quota: 1073741824, viewHistory: []});
//db.users.insert({username: 'phri', password: 'pass', orgCurator: ["PHRI"], orgAdmin: ["PHRI"], quota: 1073741824, viewHistory: []});
//db.users.insert({username: 'ninds', password: 'pass', orgCurator: [], orgAdmin: ["NINDS"], quota: 1073741824, viewHistory: []});
//db.users.insert({username: 'acrin', password: 'pass', orgCurator: ["ACRIN"], orgAdmin: [], quota: 1073741824, viewHistory: []});
//db.users.insert({username: 'grdr', password: 'pass', orgCurator: [], orgAdmin: ["GRDR"], quota: 1073741824, viewHistory: []});
//db.users.insert({username: 'eyegene', password: 'pass', orgCurator: [], orgAdmin: ["EyeGene"], quota: 1073741824, viewHistory: []});
//db.users.insert({username: 'lockedUser', password: 'pass', orgCurator: [], orgAdmin: [], viewHistory: []});
//db.users.insert({username: 'wguser', password: 'pass', orgCurator: [], orgAdmin: ['WG-TEST'], viewHistory: []});
//db.users.insert({username: 'transferStewardUser', password: 'pass', orgAdmin: ["PS&CC", "LCC"], quota: 1073741824, viewHistory: []});
//db.users.insert({username: 'docEditor', password: 'pass', orgAdmin: [], roles: ['DocumentationEditor'], quota: 1073741824, viewHistory: []});
//db.users.insert({username: 'nindsWg1User', password: 'pass', orgAdmin: [], orgCurator: ["NINDS-WG-1"], quota: 1073741824, viewHistory: []});
//db.users.insert({username: 'nindsWg2User', password: 'pass', orgAdmin: [], orgCurator: ["NINDS-WG-2"], quota: 1073741824, viewHistory: []});
//db.users.insert({username: 'boardPublisherTest', password: 'pass', orgAdmin: [], orgCurator: [], quota: 1073741824, viewHistory: []});
//db.users.insert({username: 'boardBot', password: 'pass', orgAdmin: [], orgCurator: [], quota: 1073741824, viewHistory: []});
//db.users.insert({username: 'CommentUser', password: 'pass', orgAdmin: [], orgCurator: [], quota: 1073741824, viewHistory: []});
//db.users.insert({username: 'CommentUser2', password: 'pass', orgAdmin: [], orgCurator: [], quota: 1073741824, viewHistory: []});
//db.users.insert({username: 'FormCommentUser', password: 'pass', orgAdmin: [], orgCurator: [], quota: 1073741824, viewHistory: []});
//db.users.insert({username: 'commentEditor', password: 'pass', orgAdmin: [], orgCurator: [], quota: 1073741824, viewHistory: [], roles: ["CommentReviewer"], email: "admin@email.com"});
//db.users.insert({username: 'attachmentReviewer', password: 'pass', orgAdmin: [], orgCurator: [], quota: 1073741824, viewHistory: [], roles: ["AttachmentReviewer"], email: "admin@email.com"});
//db.users.insert({username: 'ctep_fileCurator', password: 'pass', orgAdmin: [], orgCurator: ["CTEP"], quota: 1073741824, viewHistory: []});
//db.users.insert({username: 'tableViewUser', password: 'pass', orgAdmin: [], orgCurator: [], quota: 1073741824, viewHistory: []});
//db.users.insert({username: 'hiIamLongerThanSeventeenCharacters', password: 'pass', orgAdmin: [], orgCurator: ["CTEP"], quota: 1073741824, viewHistory: []});

var users = [
    {username: 'nlm', password: 'nlm', siteAdmin: true, orgAdmin: ["caBIG","CTEP","NINDS","ACRIN","PS&CC"], viewHistory: [], email: "admin@email.com"}
    , {username: 'cabigAdmin', password: 'pass', orgAdmin: ["caBIG"], quota: 1073741824, viewHistory: []}
    , {username: 'userToPromote', password: 'pass', quota: 1073741824, viewHistory: []}
    , {username: 'reguser', password: 'pass', quota: 1073741824, viewHistory: []}
    , {username: 'ctepCurator', password: 'pass', orgCurator: ["CTEP"], quota: 1073741824, viewHistory: []}
    , {username: 'createUser', password: 'pass', orgCurator: ["CTEP"], quota: 1073741824, viewHistory: []}
    , {username: 'testuser', password: 'Test123', quota: 1073741824, viewHistory: [], email: "test@example.com", roles: ["BoardPublisher", "CommentAuthor"]}
    , {username: 'boarduser', password: 'pass', quota: 1073741824, viewHistory: [], roles: ["BoardPublisher"]}
    , {username: 'boarduser1', password: 'pass', quota: 1073741824, viewHistory: [], roles: ["BoardPublisher"]}
    , {username: 'boardsearchuser', password: 'pass', quota: 1073741824, viewHistory: [], roles: ["BoardPublisher"]}
    , {username: 'boarduser2', password: 'pass', quota: 1073741824, viewHistory: [], roles: ["BoardPublisher"]}
    , {username: 'pinuser', password: 'pass', quota: 1073741824, viewHistory: []}
    , {username: 'boarduserEdit', password: 'pass', quota: 1073741824, viewHistory: []}
    , {username: 'historyuser', password: 'pass', quota: 1073741824, viewHistory: []}
    , {username: 'appScan', password: 'I@mA88Scan', quota: 1073741824, viewHistory: []}
    , {username: 'classMgtUser', password: 'pass', orgCurator: ["CTEP","NINDS"], orgAdmin: ["caBIG"], quota: 1073741824, viewHistory: []}
    , {username: 'phri', password: 'pass', orgCurator: ["PHRI"], orgAdmin: ["PHRI"], quota: 1073741824, viewHistory: []}
    , {username: 'ninds', password: 'pass', orgCurator: [], orgAdmin: ["NINDS"], quota: 1073741824, viewHistory: []}
    , {username: 'acrin', password: 'pass', orgCurator: ["ACRIN"], orgAdmin: [], quota: 1073741824, viewHistory: []}
    , {username: 'grdr', password: 'pass', orgCurator: [], orgAdmin: ["GRDR"], quota: 1073741824, viewHistory: []}
    , {username: 'eyegene', password: 'pass', orgCurator: [], orgAdmin: ["EyeGene"], quota: 1073741824, viewHistory: []}
    , {username: 'lockedUser', password: 'pass', orgCurator: [], orgAdmin: [], viewHistory: []}
    , {username: 'wguser', password: 'pass', orgCurator: [], orgAdmin: ['WG-TEST'], viewHistory: []}
    , {username: 'transferStewardUser', password: 'pass', orgAdmin: ["PS&CC", "LCC"], quota: 1073741824, viewHistory: []}
    , {username: 'docEditor', password: 'pass', orgAdmin: [], roles: ['DocumentationEditor'], quota: 1073741824, viewHistory: []}
    , {username: 'nindsWg1User', password: 'pass', orgAdmin: [], orgCurator: ["NINDS-WG-1"], quota: 1073741824, viewHistory: []}
    , {username: 'nindsWg2User', password: 'pass', orgAdmin: [], orgCurator: ["NINDS-WG-2"], quota: 1073741824, viewHistory: []}
    , {username: 'boardPublisherTest', password: 'pass', orgAdmin: [], orgCurator: [], quota: 1073741824, viewHistory: []}
    , {username: 'boardBot', password: 'pass', orgAdmin: [], orgCurator: [], quota: 1073741824, viewHistory: []}
    , {username: 'CommentUser', password: 'pass', orgAdmin: [], orgCurator: [], quota: 1073741824, viewHistory: []}
    , {username: 'CommentUser2', password: 'pass', orgAdmin: [], orgCurator: [], quota: 1073741824, viewHistory: []}
    , {username: 'FormCommentUser', password: 'pass', orgAdmin: [], orgCurator: [], quota: 1073741824, viewHistory: []}
    , {username: 'commentEditor', password: 'pass', orgAdmin: [], orgCurator: [], quota: 1073741824, viewHistory: [], roles: ["CommentReviewer"], email: "admin@email.com"}
    , {username: 'attachmentReviewer', password: 'pass', orgAdmin: [], orgCurator: [], quota: 1073741824, viewHistory: [], roles: ["AttachmentReviewer"], email: "admin@email.com"}
    , {username: 'ctep_fileCurator', password: 'pass', orgAdmin: [], orgCurator: ["CTEP"], quota: 1073741824, viewHistory: []}
    , {username: 'tableViewUser', password: 'pass', orgAdmin: [], orgCurator: [], quota: 1073741824, viewHistory: []}
    , {username: 'hiIamLongerThanSeventeenCharacters', password: 'pass', orgAdmin: [], orgCurator: ["CTEP"], quota: 1073741824, viewHistory: []}
];

users.forEach(function(u) {
    u.searchSettings = {
        "defaultSearchView": "accordion"
        , "lowestRegistrationStatus": "Incomplete"
        , "tableViewFields": {
            "cde": {
                "name": true,
                "naming": true,
                "permissibleValues": true,
                "uom": false,
                "stewardOrg": true,
                "usedBy": true,
                "registrationStatus": true,
                "administrativeStatus": false,
                "ids": true,
                "source": false,
                "updated": false
            }
        }
    };
    db.users.insert(u);
});

db.articles.insert({key: "testAdminCanEdit", body: "Admin can edit this."});
db.articles.insert({key: "testEdits", body: "Testing edits"});
