db.users.drop();
db.dataelements.drop();
db.orgs.drop();

db.users.insert({username: 'nlm', password: 'nlm', siteAdmin: true});

