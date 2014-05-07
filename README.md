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
$> wget https://download.elasticsearch.org/elasticsearch/elasticsearch/elasticsearch-0.90.7.tar.gz
```

**Note:** Get the latest version of elasticsearch

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

## Configure

Set these environment variables:

```sh
MONGOHQ_URL=mongodb://mongo_username:mongo_passwrod@mongo_host:mongo_port/db_name
VSAC_USERNAME=
VSAC_PASSWORD=
LOGDIR=
ELASTIC_URI=
```

It's also possible to create a file called envconfig.js in your cde project root directory.

```javascript
var envconfig = {
    vsac: {
        username: 'abc'
        , password: '123'
        , host: 'vsac-qa.nlm.nih.gov'
    }
    , logdir: /var/log
    , elasticUri: http://localhost:9200/nlmcde/
};
```

### Configure Elastic Search

**MongoDB** must run in **Replicate mode**. For example

```sh
$> mongod --replSet rs0
```

**Note:** If you run mongod with no data and with the replSet option, you might get this error "replSet can't get local.system.relpSet config from self or any seed (EMPTYCONFIG)".  
To solve this, run command "rs.initiate()" from mongo.

With **ElasticSearch** running, execute the following to create an index:

```sh
$> ./scripts/elasticsearch/createIndex.sh
```


Next, create a **river** for data to flow from **MongoDB** to **ElasticSearch**. 
You may need to edit the content of the file to point to the proper DB, in which case, you can make a local copy of this file.

```sh
$> ./scripts/elasticsearch/createRiver.sh
```

Finally, create an **alias** for the index. Alternatively, you can name the index nlmcde and not use aliases. The script removes a previous alias and adds a new one, 
this will fail if the alias does not already exist. Edit a local copy as needed.  

```sh
$> ./scripts/elasticsearch/aliasUpdate.sh 
```

Create an **alias** with the following:

```sh
POST to _aliases
curl -XPOST "localhost:9200/_aliases" -d'
{
    "actions": [
        { "add": {
            "alias": "nlmcde",
            "index": "nlmcde_mongo_v1"
        }}
    ]
}'
```

This will create an alias so that, when needed, a new index can be created in parallel, and the alias can be modified after indexing is complete. 

## Run Node from the cde project directory

```sh
$> node app
```

## Test

Start the **vsac mock** with 

```sh
$> ./node-js/mock/vsacMock
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