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

db.users.insert({username: 'nlm', password: 'nlm', siteAdmin: true, orgAdmin: ["caBIG","CTEP","NINDS","ACRIN","PS&CC"], viewHistory: [], email: "admin@email.com"});
db.users.insert({username: 'cabigAdmin', password: 'pass', orgAdmin: ["caBIG"], quota: 1073741824, viewHistory: []});
db.users.insert({username: 'userToPromote', password: 'pass', quota: 1073741824, viewHistory: []});
db.users.insert({username: 'reguser', password: 'pass', quota: 1073741824, viewHistory: []});
db.users.insert({username: 'ctepCurator', password: 'pass', orgCurator: ["CTEP"], quota: 1073741824, viewHistory: []});
db.users.insert({username: 'createUser', password: 'pass', orgCurator: ["CTEP"], quota: 1073741824, viewHistory: []});
db.users.insert({username: 'testuser', password: 'Test123', quota: 1073741824, viewHistory: [], email: "test@example.com", roles: ["BoardPublisher", "CommentAuthor"]});
db.users.insert({username: 'boarduser', password: 'pass', quota: 1073741824, viewHistory: [], roles: ["BoardPublisher"]});
db.users.insert({username: 'boarduser1', password: 'pass', quota: 1073741824, viewHistory: [], roles: ["BoardPublisher"]});
db.users.insert({username: 'boardsearchuser', password: 'pass', quota: 1073741824, viewHistory: [], roles: ["BoardPublisher"]});
db.users.insert({username: 'boarduser2', password: 'pass', quota: 1073741824, viewHistory: [], roles: ["BoardPublisher"]});
db.users.insert({username: 'pinuser', password: 'pass', quota: 1073741824, viewHistory: []});
db.users.insert({username: 'boarduserEdit', password: 'pass', quota: 1073741824, viewHistory: []});
db.users.insert({username: 'historyuser', password: 'pass', quota: 1073741824, viewHistory: []});
db.users.insert({username: 'appScan', password: 'I@mA88Scan', quota: 1073741824, viewHistory: []});
db.users.insert({username: 'classificationMgtUser', password: 'pass', orgCurator: ["CTEP","NINDS"], orgAdmin: ["caBIG"], quota: 1073741824, viewHistory: []});
db.users.insert({username: 'phri', password: 'pass', orgCurator: ["PHRI"], orgAdmin: ["PHRI"], quota: 1073741824, viewHistory: []});
db.users.insert({username: 'ninds', password: 'pass', orgCurator: [], orgAdmin: ["NINDS"], quota: 1073741824, viewHistory: []});
db.users.insert({username: 'acrin', password: 'pass', orgCurator: ["ACRIN"], orgAdmin: [], quota: 1073741824, viewHistory: []});
db.users.insert({username: 'grdr', password: 'pass', orgCurator: [], orgAdmin: ["GRDR"], quota: 1073741824, viewHistory: []});
db.users.insert({username: 'eyegene', password: 'pass', orgCurator: [], orgAdmin: ["EyeGene"], quota: 1073741824, viewHistory: []});
db.users.insert({username: 'lockedUser', password: 'pass', orgCurator: [], orgAdmin: [], viewHistory: []});
db.users.insert({username: 'wguser', password: 'pass', orgCurator: [], orgAdmin: ['WG-TEST'], viewHistory: []});
db.users.insert({username: 'transferStewardUser', password: 'pass', orgAdmin: ["PS&CC", "LCC"], quota: 1073741824, viewHistory: []});
db.users.insert({username: 'docEditor', password: 'pass', orgAdmin: [], roles: ['DocumentationEditor'], quota: 1073741824, viewHistory: []});
db.users.insert({username: 'nindsWg1User', password: 'pass', orgAdmin: [], orgCurator: ["NINDS-WG-1"], quota: 1073741824, viewHistory: []});
db.users.insert({username: 'nindsWg2User', password: 'pass', orgAdmin: [], orgCurator: ["NINDS-WG-2"], quota: 1073741824, viewHistory: []});
db.users.insert({username: 'boardPublisherTest', password: 'pass', orgAdmin: [], orgCurator: [], quota: 1073741824, viewHistory: []});
db.users.insert({username: 'boardBot', password: 'pass', orgAdmin: [], orgCurator: [], quota: 1073741824, viewHistory: []});
db.users.insert({username: 'anonymousCommentUser', password: 'pass', orgAdmin: [], orgCurator: [], quota: 1073741824, viewHistory: []});
db.users.insert({username: 'anonymousCommentUser2', password: 'pass', orgAdmin: [], orgCurator: [], quota: 1073741824, viewHistory: []});
db.users.insert({username: 'anonymousFormCommentUser', password: 'pass', orgAdmin: [], orgCurator: [], quota: 1073741824, viewHistory: []});
db.users.insert({username: 'commentEditor', password: 'pass', orgAdmin: [], orgCurator: [], quota: 1073741824, viewHistory: [], roles: ["CommentReviewer"], email: "admin@email.com"});
db.users.insert({username: 'attachmentReviewer', password: 'pass', orgAdmin: [], orgCurator: [], quota: 1073741824, viewHistory: [], roles: ["AttachmentReviewer"], email: "admin@email.com"});
db.users.insert({username: 'ctep_fileCurator', password: 'pass', orgAdmin: [], orgCurator: ["CTEP"], quota: 1073741824, viewHistory: []});

db.articles.insert({key: "testAdminCanEdit", body: "Admin can edit this."});
db.articles.insert({key: "testEdits", body: "Testing edits"});
