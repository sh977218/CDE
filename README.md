# NLM CDE
## Install
### Prerequisites
* Mongodb - 4.2
* ElasticSearch 7.1 (tested with 7.8)
* Node.js - 12
* Gradle 5.3

### Create & Configure Application Environment
Add to ~/.bashrc:
```sh
export PATH=<Node>:<JDK bin>:<MongoDB bin>:<Gradle bin>:<Maven bin>:$PATH
export JAVA_HOME=<JDK>
export GRADLE_HOME=<Gradle>

# CDE Common Data Elements
cd /c/cde
export NODE_CONFIG='{"vsac": {"username": "<UMLS username>", "password": "<UMLS password>"}, "uts": {"apikey": "<UMLS apikey>"}}'
export NODE_ENV=test
```
The NODE_CONFIG credentials are used for UMLS and VSAC ticket service validation and TGT used in the application whether the user is signed in or not. (Federated service validation is used for user sign in.)

### Configure Mongo db
**MongoDB** must run in **Replicate mode**. 
In a separate terminal, run  
```sh
$> mongod --replSet rs0 --dbpath /path/to/data/db
```

In another terminal, open up mongo. 
```sh
$> mongo
```

Then, initiate MongoDB replica set:
```javascript
rs.initiate()
```

#### Establish users
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

#### Restart mongo server with auth on.
```sh
$> mongod --auth --replSet rs0 --dbpath /path/to/data/db
```

### Preparing to run
Before running the app, run:
```sh 
$/cde/> npm i
```
This will install all the various packages needed for the app to function. 


Before you start the app, run:
 ```sh
$/cde/> sh restore-test-instance.sh 
 ```
This will populate the mongo database with a test dataset. From there, the app (once it starts running) will ingest the data in the mongo database

Next, you need to set up the various front end files used in the project:
```sh
$/cde/> npm run gulp
```

### Compile Static Homepage
1. Do a prod build.
1. Reload node server.
1. In Chrome, load CDE Search Welcome page, then navigate to home page while logged out. ___(navigating directly to home would serve the existing static page)___
1. In the Devtool Elements Tab, right-click the specified tag and click "Copy Element" to copy the following:
   1. Copy the matching __\<style>__ tags to __one.css__ and __three.css__.
   1. Copy __<nih-cde>__ to __nihcde.html__ and run `./scripts/buildHomeCleanup.sh` (re-runnable).
      1. If the "Boards" or "Help" menu has changed, manually edit __./scripts/buildHomeCleanup.sh__ to recreate the new menu with JS classes.
1. Run `npm run gulp buildHome`.
1. Deliver any changes to __/modules/_app/staticHome/__.
1. Restart node to view changes.
1. Verify:
   1. _Boards_ and _Help_ drop-downs work. Quick Board number is accurate.
   2. Carousel rotates and buttons work.
   3. The mobile menu has button in top-right corner and opens from the right with:
      1. _Boards_ and _Help_ drop-downs work.
      1. Quick Board number appears.
1. To update the production build, run `npm run gulp`.

# Run Node
```sh
$/cde/> npm start
```

For the __test__ environment, in a separate window, run:
```shell
$/cde/> npm run testServer
```

## Special Runs
Environment variables:
* __BUNDLE_REPORT=true__ - _(client only)_ turn on bundle analyzer report, runs a web server and opens the report, report based on the parsed size(size of output JS), Ctrl+c when finished
* __COVERAGE=true__ - _(client only)_ turn on source mapping (source mapping is always on for server), still need to run from nyc

## Special Builds
### Server Development
1. Node without server development
    * ```npm run buildNode```
    * ```npm start```
<!--
1. Node without server development (interpreted)
   * ```npm run startTs```
1. Node with auto restart
   * ```node dev-app.js ```
1. Node with auto restart and hot module replacement
   * ```node devHmr-app.js```
1. Node with no restart and hot module replacement
   * ```node devHmr-app.js prod```
1. Hot module replacement only, start node in debugger
   * ```node devHmr-app.js none```
-->

### Angular Client Development
#### Main App
1. Angular build without development
    * ```npm run buildApp```
1. Angular build with development and watch
    * ```npm run devApp```
1. Angular build with hot-module replacement.
    * ```node devHmr-app.js```

#### Native Render App (Fhir and Embed Apps are similar)
1. Angular build without development
    * ```npm run buildNative```
1. Angular build with development and watch
    * ```npm run devNative```


If your IDE encounter errors like

`'bash' is not recognized as an internal or external command,
operable program or batch file.
`
Run ```npm config set script-shell "/c//tools//git//bin//bash.exe"```

# Test
## Prerequisites 
* Selenium-Server-Standalone
* Chromedriver
* Java JRE
* Java JDK
* Intellij Community Edition

## Set up
(Note, in the following instructions, we make reference to something called PATH TO. Replace the "PATH TO"'s with the actual paths to the directories in question)

First, edit your bashrc file to include the following:
```
    alias hubStart='java -jar /c/PATH TO /selenium-server-standalone-2.53.0.jar -role hub'
    alias nodeStart='java -jar /c/PATH TO/selenium-server-standalone-2.53.0.jar -role node -maxSession 7 -hub http://localhost:4444/grid/register -browser browserName="chrome",maxInstances=7 -Dwebdriver.chrome.driver=/c/PATH TO/chromedriver.exe'
    export HUB_URL=http://localhost:4444/wd/hub
    export TEST_URL=http://localhost:3001
```

Next, open Intellij, create a new project rooted at C:\PATH TO\cde\test\selenium


## Running the tests
In the following order, run these commands, all of them either in their own terminals, or as a daemon:
1. `sh hubStart`
1. `sh nodeStart`     

Now, you need the app running in some way when you run the test.

We have include a script, start-test-instance.sh, that, in addition to running all the tests, also runs the app. We suggest that you use it.

(Don’t forget to have elastic and mongo running while you run the app, even if you are running it throught he start-test-instance script)

If, for some reason, you don't want to use it (for example, if you just want to run one test), you will need to run the app before you can run any tests

## Code Coverage
Run in Bamboo and override variable "browser" with value "coverage"

# Code Maintenance
## Structure
* Business Rules and Models go into __shared/__
* View Models and Angular-dependent code go into __modules/__
* Database entities and Node-dependent code go into __server/__

## Theming
### Colors
Update theme.scss.
For custom angular colors extract the colors in common.scss by variable to theme.scss
### Image Minification
Procedure Lost...
Trial Procedure
* SVG
    * Use as-is.
* PNG
    * Run  __/modules/cde/public/assets/img__ through https://tinypng.com/ and place in __/modules/cde/public/assets/img/min__.
* JPEG/WEBP
    * Unknown but currently not used.

# CDE Ingesters
For bulk loading new CDEs/Forms into the system a custom program called a loader must be written. To 
write and test a loader a connection to the QA environment from the local machine needs to be made.
This process requires multiple steps. More information can be found here: [Ingester README](ingester/README.md)
