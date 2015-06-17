Step 1: start mongo instance 1 without auth
//default port 27017
mongod --port 27017 --dbpath ../mongo/data1 --replSet rs0
mongod --port 27018 --dbpath ../mongo/data2 --replSet rs0

Step 2: log in to 1 instance, then set up replicateSet and user
# set up replicateSet
mongo --host localhost --port 27018
rs.initiate();
rs.add("NLM01961050MLB:27017");
rs.config();
rs.status();
# make instance 27017 primary manually
var cfg = rs.conf()
cfg.members[0].priority = 1
cfg.members[1].priority = 10
rs.reconfig(cfg)
# log in on primary instance
mongo --host localhost --port 27017
# create super user
use admin;
db.createUser( {
    user: "siteRootAdmin",
    pwd: "password",
    roles: [ { role: "root", db: "admin" },
			{ role: "dbAdmin", db: "test" },			
			{ role: "dbAdmin", db: "cde-logs-test" } ]
  });

Step 3: restart mongo instances with auth enabled
mongod --config ../mongo/mongodb1.conf
mongod --config ../mongo/mongodb2.conf
  
Step 4: import data
mongo test deploy/dbInit.js -u siteRootAdmin -p password -authenticationDatabase admin
mongo test test/data/testForms.js -u siteRootAdmin -p password -authenticationDatabase admin
mongo cde-logs-test deploy/logInit.js -u siteRootAdmin -p password -authenticationDatabase admin
mongorestore -d test -c dataelements test/data/cdedump/dataelements.bson -u siteRootAdmin -p password -authenticationDatabase admin
mongorestore -d test -c forms test/data/nindsDump/test/forms.bson -u siteRootAdmin -p password -authenticationDatabase admin
mongoimport --drop -d test -c orgs test/data/cdedump/orgs.json -u siteRootAdmin -p password -authenticationDatabase admin
mongo test test/createLargeBoard.js -u siteRootAdmin -p password -authenticationDatabase admin
mongo test test/createManyBoards.js -u siteRootAdmin -p password -authenticationDatabase admin
mongo test test/initOrgs.js -u siteRootAdmin -p password -authenticationDatabase admin 
