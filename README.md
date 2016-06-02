# NLM CDE

## Install

### Prerequisites

 * Java -1.8
 * Node.js - 4.5
 * Gradle *
 * Mongodb - 2.6.7
 * ElasticSearch 2.3


## Configure **elascticsearch.yml** 

In order to run this application, you need to edit the Elasticsearch.yml.  This can be found in the config folder of elasticsearch.
Add the following lines to the end of the .yml file

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






## Prerequisites 

Selenium-Server-Standalone *
Chromedriver *
Java JRE *
Java JDK *
Intellij Community Edition *


============

(Note, in the following instructions, we make reference to something called PATH TO. Replace the "PATH TO"'s with the actual paths to the directories in question)


First, edit your bashrc file to include the following



    alias hubStart='java -jar /c/PATH TO /selenium-server-standalone-2.53.0.jar -role hub'
    alias nodeStart='java -jar /c/PATH TO/selenium-server-standalone-2.53.0.jar -role node -maxSession 7 -hub http://localhost:4444/grid/register -browser browserName="chrome",maxInstances=7 -Dwebdriver.chrome.driver=/c/PATH TO/chromedriver.exe'
    export HUB_URL=http://localhost:4444/wd/hub
    export TEST_URL=http://localhost:3001


Next, open Intellij, create a new project rooted at C:\PATH TO\cde\test\selenium


## Running the tests

Don’t forget to have elastic and mongo running while you run the following

In the following order, run these commands, all of them either in their own terminals, or as a deamon 

1 ```sh hubStart ```
2 ```sh nodeStart ```     
3 ```sh	$> node ./modules/cde/node-js/mock/vsacMock.js ```

Now, you need the app running in some way when you run the test. 

We have include a script, start-test-instance.sh, that, in addition to running all the tests, also runs the app. We suggest that you use it.

If, for some reason, you don't want to use it (for example, if you just want to run one test), you will need to run the app before you can run any tests
