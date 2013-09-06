db.users.drop();
db.dataelements.drop();
db.orgs.drop();

db.users.insert({username: 'nlm', password: 'nlm', siteAdmin: true});

db.users.insert({username: 'cabigAdmin', password: 'pass', orgAdmin: ["caBIG"]});

db.users.insert({username: 'user1', password: 'pass'});
