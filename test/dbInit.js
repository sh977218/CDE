db.users.drop();
db.dataelements.drop();
db.orgs.drop();
db.forms.drop();

db.users.insert({username: 'nlm', password: 'nlm', siteAdmin: true, orgAdmin: ['NLM']});
db.users.insert({username: 'cabigAdmin', password: 'pass', orgAdmin: ["caBIG"], quota: 1073741824});
db.users.insert({username: 'user1', password: 'pass', quota: 1073741824});
db.users.insert({username: 'ctepCurator', password: 'pass', orgCurator: ["CTEP"], quota: 1073741824});
db.users.insert({username: 'testuser', password: 'Test123', quota: 1073741824});

