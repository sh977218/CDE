db.users.remove({});
db.dataelements.remove({});
db.orgs.remove({});
db.forms.remove({});
db.pinningBoards.remove({});
db.messages.remove({});
db.sessions.remove({});

var defaultBoard = {
    name: "default"
    , shareStatus: "Private"
    , pins: []
};

db.users.insert({username: 'nlm', password: 'nlm', siteAdmin: true, orgAdmin: ['NLM'], viewHistory: []});
db.users.insert({username: 'cabigAdmin', password: 'pass', orgAdmin: ["caBIG"], quota: 1073741824, viewHistory: []});
db.users.insert({username: 'user1', password: 'pass', quota: 1073741824, viewHistory: []});
db.users.insert({username: 'reguser', password: 'pass', quota: 1073741824, viewHistory: []});
db.users.insert({username: 'ctepCurator', password: 'pass', orgCurator: ["CTEP"], quota: 1073741824, viewHistory: []});
db.users.insert({username: 'testuser', password: 'Test123', quota: 1073741824, viewHistory: []});
db.users.insert({username: 'boarduser', password: 'pass', quota: 1073741824, viewHistory: []});
db.users.insert({username: 'historyuser', password: 'pass', quota: 1073741824, viewHistory: []});
db.users.insert({username: 'appScan', password: 'I@mA88Scan', quota: 1073741824, viewHistory: []});
db.users.insert({username: 'classificationMgtUser', password: 'pass', orgCurator: ["CTEP"], orgAdmin: ["caBIG"], quota: 1073741824, viewHistory: []});
db.users.insert({username: 'phri', password: 'pass', orgCurator: ["PHRI"], orgAdmin: ["PHRI"], quota: 1073741824, viewHistory: []});
db.users.insert({username: 'ninds', password: 'pass', orgCurator: [], orgAdmin: ["NINDS"], quota: 1073741824, viewHistory: []});

db.orgs.insert({name: "NHLBI"});
db.orgs.insert({name: "caCORE"});
db.orgs.insert({name: "NIDCR"});
db.orgs.insert({name: "caBIG"});
db.orgs.insert({name: "CTEP"});
db.orgs.insert({name: "DCP"});
db.orgs.insert({name: "PS&CC"});
db.orgs.insert({name: "CCR"});
db.orgs.insert({name: "NINDS"});
db.orgs.insert({name: "ACRIN"});
db.orgs.insert({name: "SPOREs"});
db.orgs.insert({name: "NICHD"});
db.orgs.insert({name: "EDRN"});
db.orgs.insert({name: "CIP"});
db.orgs.insert({name: "AECC"});
db.orgs.insert({name: "LCC"});
db.orgs.insert({name: "USC/NCCC"});
db.orgs.insert({name: "Training"});
db.orgs.insert({name: "TEST"});
db.orgs.insert({name: "PBTC"});
db.orgs.insert({name: "CITN"});
db.orgs.insert({name: "DCI"});
db.orgs.insert({name: "CDC/PHIN"});
db.orgs.insert({name: "ECOG-ACRIN"});
db.orgs.insert({name: "OHSU Knight"});
db.orgs.insert({name: "NHC-NCI"});
db.orgs.insert({name: "NIDA"});
db.orgs.insert({name: "PhenX"});
db.orgs.insert({name: "AHRQ"});
db.orgs.insert({name: "PHRI"});


