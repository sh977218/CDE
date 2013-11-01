db.users.drop();
db.dataelements.drop();
db.orgs.drop();
db.forms.drop();

db.users.insert({username: 'nlm', password: 'nlm', siteAdmin: true, orgAdmin: ['NLM']});
db.users.insert({username: 'cabigAdmin', password: 'pass', orgAdmin: ["caBIG"]});
db.users.insert({username: 'user1', password: 'pass'});
db.users.insert({username: 'ctepCurator', password: 'pass', orgCurator: ["CTEP"]});
db.users.insert({username: 'testuser', password: 'Test123'});

