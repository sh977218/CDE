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

In another terminal, open up mongo. 
```sh
$> mongo
```

Then, initiate MongoDB replica set:
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

## Restart mongo server with auth on.

## Preparing to run

Before running the app, run 

```sh 
$/cde/>  npm install -a
```

This will install all the various packages needed for the app to function. 


Before you start the app, run
 
 ```sh
$/cde/> sh restore-test-instance.sh 
 ```
 
 This will populate the mongo database with a test dataset. From there, the app (once it starts running) will ingest the data in the mongo database

Next, you need to set up the various front end files used in the project. 

(Note: if you are having trouble with gulp not installing all the bower components, delete your bower_components file, and try again)

```sh
$/cde/> gulp
```

If you get an error message here, complaining that you don’t have gulp, run 

```sh
$/cde/>  npm -install -g gulp
```

## Compile Static Homepage
1. Do a prod build.
1. After the build, In Chrome, load CDE Search Welcome page, then navigate to home page while logged out. ___(navigating directly to home would serve the existing static page)___
1. In the Devtool Elements Tab, right click the specified tag and click "Copy Element" to copy the following:
   1. Copy the matching __\<style>__ tags to __one.css__ and __three.css__.
   1. Copy __<nih-cde>__ to __nihcde.html__. ___\*\*\*INSTRUCTIONS MISSING\*\*\*___
      1. (Remove Angular related properties from element. i.e. [routeLink]="XXXXXX").
      1. For slideshow slides:
         1. Replace paths __/app/__ to __/launch/__ path.
         1. For __source@srcset__ and __img@src__, prepend attributes with __data-__.
1. Run `gulp buildHome`.
1. Check-in the resulting css, html, png files and home-launch.ejs into git while removing old versions.
1. Restart node to view changes.
1. To update the production build, run `gulp`.


## Run Node from the cde project directory

```sh
$> node app
```






# Test






## Prerequisites 

Selenium-Server-Standalone *
Chromedriver *
Java JRE *
Java JDK *
Intellij Community Edition *

## Set up
(Note, in the following instructions, we make reference to something called PATH TO. Replace the "PATH TO"'s with the actual paths to the directories in question)


First, edit your bashrc file to include the following



    alias hubStart='java -jar /c/PATH TO /selenium-server-standalone-2.53.0.jar -role hub'
    alias nodeStart='java -jar /c/PATH TO/selenium-server-standalone-2.53.0.jar -role node -maxSession 7 -hub http://localhost:4444/grid/register -browser browserName="chrome",maxInstances=7 -Dwebdriver.chrome.driver=/c/PATH TO/chromedriver.exe'
    export HUB_URL=http://localhost:4444/wd/hub
    export TEST_URL=http://localhost:3001


Next, open Intellij, create a new project rooted at C:\PATH TO\cde\test\selenium


## Running the tests


In the following order, run these commands, all of them either in their own terminals, or as a deamon 

1 ```sh hubStart ```

2 ```sh nodeStart ```     

Now, you need the app running in some way when you run the test.

We have include a script, start-test-instance.sh, that, in addition to running all the tests, also runs the app. We suggest that you use it.

(Don’t forget to have elastic and mongo running while you run the app, even if you are running it throught he start-test-instance script)


If, for some reason, you don't want to use it (for example, if you just want to run one test), you will need to run the app before you can run any tests
