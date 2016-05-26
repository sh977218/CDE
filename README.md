# NLM CDE

## Install

### Prerequisites

 * Java -1.8
 * Node.js - 4.5
 * Gradle *
 * Mongodb - 2.6.7
 * ElasticSearch 2.3


## Configure **elascticsearch.yml** 

In order to run this application, you need to edit the Elasticsearch.yml.  This can be found in the config folder of elasticsearch. Add the following lines to the end of the .yml file




    * script.engine.groovy.inline.update: on  
    * script.inline: on
    * script.indexed: on
    * script.engine.groovy.inline.aggs: on

## Create & Configure Application Environment

Next, navigate to your CDE directory, and run 


```sh
$/cde/> export NODE_ENV=test
```

This will establish your config environment

### Configure Elastic Search

**MongoDB** must run in **Replicate mode**. 
In a separate terminal, run  


```sh
$> mongod --replSet rs0
```

Then, initiate MongoDB replica set:

In another terminal, open up mongo. 

```javascript
rs.initiate()
```
## Establish users


Next, you will have to create several users for the app, in order for various aspects to function 
properly. In the same mongo terminal, run the following commands in this order


```sh
use admin;
db.createUser( { user: "siteRootAdmin", pwd: "password", roles: [ { role: "root", db: "admin" }, { role: "dbAdmin", db: "test" }, { role: "dbAdmin", db: "cde-logs-test" } ] });
```


```sh
   use test;
   db.createUser({ user: "cdeuser", pwd: "password", roles: [ { role: "readWrite", db: "test" } ] });
   ```

```sh
use cde-logs-test;
db.createUser({ user: "cdeuser", pwd: "password", roles: [ { role: "readWrite", db: "cde-logs-test" } ] });
```

```sh
use migration;
db.createUser({ user: "miguser", pwd: "password", roles: [ { role: "readWrite", db: "migration" } ] });
```

## Preparing to run

Before running the app, run 

```sh 
$/cde/>  npm install -a
```

This will install all the various packages needed for the app to function. 


Before you start the app, run
 
 ```sh
$/cde/> sh start-test-instance.sh 
 ```
 
 This will populate the mongo database with a test dataset. From there, the app (once it starts running) will ingest the data in the mongo database into the elastic database (this should take a few minutes. Go get a cup of coffee)

Next, you need to set up the various angular files used in the project. 

```sh
$/cde/> gulp bower wiredep
```

If you get an error message here, complaining that you don’t have gulp, run 

```sh
$/cde/>  npm -install -g gulp
```


## Run Node from the cde project directory

```sh
$> node app
```



!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
## Test

Start the **vsac mock** with 

```sh
$> node ./modules/cde/node-js/mock/vsacMock
```

You may need to generate your own **ssl** server key. 

Download **ChromeDriver**, possibly from here:

[https://code.google.com/p/chromedriver/downloads/list](https://code.google.com/p/chromedriver/downloads/list)


Move the **chromedriver** executable into test/selenium.
You may try testing with Firefox but Selenium is bad with Firefox. At this time, version 24 seems ok, but not version 26.

Create test database and elastic search indexes:

```sh
$> ./start-test-instance.sh
```

## Remote Testing

SSH to the desired server and do the following.

```sh
$> export NODE_ENV=test
$> node modules/cde/node-js/mock/vsackMock.js
```

Run grunt and re-ingest the test collection.

```sh
$> node node-js/app.js
```

On your local computer, run grunt and select remote testing.

### Seed

To seed data

```sh
$> ./upload.sh
```

### Run

To run the app: 

```sh
$> node app
```

### How to create two mongo instances and enable authentication
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
mongo test test/initOrgs.js -u siteRoot
