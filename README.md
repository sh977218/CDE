# NLM CDE

## Install

###Prerequisites

    * Java
    * Node.js
    * Gradle
    * Groovy
    * Mongodb
    * ElasticSearch
    * Elastic River for MongoDB

**ElasticSearch** should be installed with the river for mongo plugin.

```sh
$> wget https://download.elasticsearch.org/elasticsearch/elasticsearch/elasticsearch-1.1.1.tar.gz
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

```sh
$> bin/plugin --install com.github.richardwilly98.elasticsearch/elasticsearch-river-mongodb/1.7.3
```

Versions numbers should match per river plugin doc. 

Install javascript plugin

```sh
$> bin/plugin -install elasticsearch/elasticsearch-lang-javascript/1.4.0
```


Install mapper attachment plugin

```sh
$> bin/plugin -install elasticsearch/elasticsearch-mapper-attachments/1.6.0
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
$> node ./node-js/mock/vsacMock
```

You may need to generate your own **ssl** server key. 

Download **ChromeDriver**, possibly from here:

[https://code.google.com/p/chromedriver/downloads/list](https://code.google.com/p/chromedriver/downloads/list)


Move the **chromedriver** executable into test/selenium.
You may try testing with Firefox but Selenium is bad with Firefox. At this time, version 24 seems ok, but not version 26.

Create test database and elastic search indexes:

```sh
$> ./test/testInit.sh
```

To run the test suite

```sh
$> ./start-test-instance.sh
```

## Remote Testing

SSH to the desired server and do the following.

```sh
$> export NODE_ENV=test
$> node node-js/mock/vsackMock.js
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

To upload some forms: 

```sh
$> groovy UploadCadsrForms
```

### Run

To run the app: 

```sh
$> node app
```