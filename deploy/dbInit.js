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

var oldSettings = {
    "defaultSearchView" : "accordion",
    "lowestRegistrationStatus" : "Incomplete",
    "tableViewFields" : {
        "cde" : {
            "name" : true,
            "naming" : true,
            "permissibleValues" : true,
            "uom" : false,
            "stewardOrg" : true,
            "usedBy" : true,
            "registrationStatus" : true,
            "administrativeStatus" : false,
            "ids" : true,
            "source" : false,
            "updated" : false
        }
    }
};

var users = [
    {
        username: 'nlm',
        password: 'nlm',
        siteAdmin: true,
        orgAdmin: ["caBIG", "CTEP", "NINDS", "ACRIN", "PS&CC", "org / or Org", "TEST"],
        viewHistory: [],
        email: "admin@email.com"
    }
    , {username: 'cabigAdmin', password: 'pass', orgAdmin: ["caBIG"], quota: 1073741824, viewHistory: [], roles: ["FormEditor"]}
    , {username: 'userToPromote', password: 'pass', quota: 1073741824, viewHistory: []}
    , {username: 'reguser', password: 'pass', quota: 1073741824, viewHistory: []}
    , {username: 'ctepCurator', password: 'pass', orgCurator: ["CTEP"], quota: 1073741824, viewHistory: [], roles: ["FormEditor"]}
    , {username: 'ctepOnlyCurator', password: 'pass', orgCurator: ["CTEP"], quota: 1073741824, viewHistory: []}
    , {username: 'createUser', password: 'pass', orgCurator: ["CTEP"], quota: 1073741824, viewHistory: []}
    , {username: 'testuser', password: 'pass', quota: 1073741824, viewHistory: [], email: "test@example.com",
        roles: ["BoardPublisher", "CommentAuthor"]}
    , {username: 'boarduser', password: 'pass', quota: 1073741824, viewHistory: [], roles: ["BoardPublisher"]}
    , {username: 'boarduser1', password: 'pass', quota: 1073741824, viewHistory: [], roles: ["BoardPublisher"]}
    , {username: 'boardsearchuser', password: 'pass', quota: 1073741824, viewHistory: [], roles: ["BoardPublisher"]}
    , {username: 'boarduser2', password: 'pass', quota: 1073741824, viewHistory: [], roles: ["BoardPublisher"]}
    , {username: 'boardexport', password: 'pass', quota: 1073741824, viewHistory: [], roles: ["BoardPublisher"]}
    , {username: 'pinuser', password: 'pass', quota: 1073741824, viewHistory: []}
    , {username: 'unpinuser', password: 'pass', quota: 1073741824, viewHistory: []}
    , {username: 'doublepinuser', password: 'pass', quota: 1073741824, viewHistory: []}
    , {username: 'boarduserEdit', password: 'pass', quota: 1073741824, viewHistory: []}
    , {username: 'historyuser', password: 'pass', quota: 1073741824, viewHistory: []}
    , {username: 'appScan', password: 'I@mA88Scan', quota: 1073741824, viewHistory: []}
    , {username: 'classMgtUser', password: 'pass', orgCurator: ["CTEP","NINDS", "PS&CC", "ACRIN"], orgAdmin: ["caBIG"], quota: 1073741824, viewHistory: []}
    , {username: 'phri', password: 'pass', orgCurator: ["PHRI"], orgAdmin: ["PHRI"], quota: 1073741824, viewHistory: []}
    , {username: 'ninds', password: 'pass', orgCurator: [], orgAdmin: ["NINDS"], quota: 1073741824, viewHistory: [], roles: ["FormEditor"]}
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
    , {username: 'commentEditor', password: 'pass', orgAdmin: [], orgCurator: [], quota: 1073741824, viewHistory: []
        , roles: ["CommentReviewer"], email: "admin@email.com"}
    , {username: 'attachmentReviewer', password: 'pass', orgAdmin: [], orgCurator: [], quota: 1073741824, viewHistory: []
        , roles: ["AttachmentReviewer"], email: "admin@email.com"}
    , {username: 'ctep_fileCurator', password: 'pass', orgAdmin: [], orgCurator: ["CTEP"], quota: 1073741824, viewHistory: [], roles: ["FormEditor"]}
    , {username: 'tableViewUser', password: 'pass', orgAdmin: [], orgCurator: [], quota: 1073741824, viewHistory: []}
    , {username: 'hiIamLongerThanSeventeenCharacters', password: 'pass', orgAdmin: [], orgCurator: ["CTEP"], quota: 1073741824
        , viewHistory: []}
    , {username: 'selenium', password: 'pass', orgAdmin: [], orgCurator: ["SeleniumOrg"], quota: 1073741824, viewHistory: []
        , roles: ["FormEditor"]}
    , {username: 'pinAllBoardUser', password: 'pass', orgAdmin: ["NINDS"], orgCurator: ["NINDS"], quota: 1073741824, viewHistory: []}
    , {username: 'exportBoardUser', password: 'pass', orgAdmin: ["NINDS"], orgCurator: ["NINDS"], quota: 1073741824, viewHistory: []
        , roles: ["BoardPublisher"]}
    , {username: 'testAdmin', password: 'pass', orgAdmin: ["TEST"], orgCurator: [], quota: 1073741824, viewHistory: [], roles: ["FormEditor"]}
    , {username: 'theOrgAuth', password: 'pass', orgAdmin: [], orgCurator: [], quota: 1073741824, viewHistory: []
        , roles: ["OrgAuthority"]}
    , {username: 'theOrgAuth', password: 'pass', orgAdmin: [], orgCurator: [], quota: 1073741824, viewHistory: [], roles: ["OrgAuthority"]}
    , {username: 'classifyBoardUser', password: 'pass', orgAdmin: ["TEST"], orgCurator: [], quota: 1073741824, viewHistory: [], roles: []}
];

users.forEach(function(u) {
    u.searchSettings = {
        "version": 20160329
        , "defaultSearchView": "summary"
        , "lowestRegistrationStatus": "Incomplete"
        , "tableViewFields": {
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
    };
    db.users.insert(u);
});

db.users.insert({username: 'oldUser', password: 'pass', orgAdmin: [], orgCurator: [], quota: 1073741824, viewHistory: [], roles: [], searchSettings: oldSettings});

db.articles.insert({key: "testAdminCanEdit", body: "Admin can edit this."});
db.articles.insert({key: "testEdits", body: "Testing edits"});
