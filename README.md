# NLM CDE

## Install

###Prerequisites

    * Java
    * Node.js 0.10.x
    * Gradle
    * Groovy
    * Mongodb - 2.6.7
    * ElasticSearch 1.4.3
    * Elastic River for MongoDB - 2.0.5

**ElasticSearch** should be installed with the river for mongo plugin.

```sh
$> wget https://download.elasticsearch.org/elasticsearch/elasticsearch/elasticsearch-1.4.3.tar.gz
```

configure **elascticsearch.yml** 

    * path.data
    * path.work
    * path.logs
    * plugin.mandatory: mapper-attachments, lang-javascript, river-mongodb
    * cluster.name: yourclustername
    * node.name: "Your Name"
    * node.master: true
    * node.data: true
    * index.number_of_shards: 1
    * index.number_of_replicas: 0
    * script.disable_dynamic: false
    * script.groovy.sandbox.enabled: false
    * script.js.sandbox.enabled: true

```sh
$> ./bin/plugin --install com.github.richardwilly98.elasticsearch/elasticsearch-river-mongodb/2.0.5
```

Versions numbers should match per river plugin doc. 

Install javascript plugin

```sh
$> ./bin/plugin --install elasticsearch/elasticsearch-lang-javascript/2.3.1
```


Install mapper attachment plugin

```sh
$> ./bin/plugin --install elasticsearch/elasticsearch-mapper-attachments/2.4.1
```

**Note:** Get the latest version of the plugins at: http://www.elasticsearch.org/guide/en/elasticsearch/reference/1.x/modules-plugins.html

## Create & Configure Application Environment
The NLM CDE application can run on a single computer in different configurations. 

First of all create and setup a configuration file for your local instance:

```sh
$> cp ./configure/config.sample.js ./configure/my-env.js
```

Secondly, specify the desired configuration by setting up NODE_ENV environment variable:

```sh
$> export NODE_ENV=my_env
```

The application will automaticaly use the settings from the ./configure/my-env.js file whenever running node node-js/app.js, grunt or node node-js/mock/vsacMock.js.


### Configure Elastic Search

**MongoDB** must run in **Replicate mode**. For example

```sh
$> mongod --replSet rs0
```

Initiate MongoDB replica set:

```javascript
rs.initiate()
```

With **ElasticSearch** running, run grunt and rebuild ElasticSearch indices.


## Run Node from the cde project directory

```sh
$> node app
```

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
