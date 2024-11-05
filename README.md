
# NLM CDE
## Install
### Prerequisites
* Mongodb - 5.0
* ElasticSearch 7.1 (tested with 7.8)
* Node.js - 12
* Gradle 5.3

### Create & Configure Application Environment
Add to ~/.bashrc:
```shell
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
1. Start MongoDB server, with auth disabled
   1. CLI
       ```shell
       $> mongod --dbpath /path/to/data/db
       ```
   2. mongo config
       ```shell
       $> mongod -f /path/to/mongo/config.cfg
       ```
       ```yaml
        ## example of /path/to/mongo/config.cfg
        storage:
          dbPath: /path/to/data/db
        security:
          authorization: enabled # here is the config for auth
          keyFile: /path/to/data/db/mongodb.key # this key is needed if auth enabled
       ```

3. Add system user, this user is used by manipulate system admin permission, note it does not have permission to read/write in other db
    ```shell
    use admin;
    db.createUser(
      {
        user: "siteRootAdmin",
        pwd: "password",
        roles: [
               {role: 'root', db: 'admin' }
               ]
      }
    )
    ```

2. Add application CDE user,  this user is used by `restore-test-instance.sh`
    ```shell
    use admin;
    db.createUser(
      {
        user: "cdeuser",
        pwd: "password",
        roles: [
                {role: 'readWrite', db: 'test'},
                {role: 'readWrite', db: 'cde-logs-test'}
              ]
      }
    )
   ```

3. Restart MongoDB server, with auth enabled

### Preparing to run app (run each step in a separated terminal)
1. Install dependencies 
    ```shell
    $/cde/> npm i
    ```
2. Build server and client code
    ```shell
    $/cde/> npm run build
    ```
3. Start Node server
    ```shell
    $/cde/> npm run start
    ```
4. Start login server, mocking NIH CIT login
    ```shell
    $/cde/> npm run testServer
    ```
5. Start CDE application
    ```shell
    $/cde/> ng s cde-cli
    ```
6. Start Native Render application
    ```shell
    $/cde/> ng s nativeRender --port 4300
    ```
7. Open browser to view application `http://localhost:4200/home`

### Troubleshoot
1. If your terminal encounters error: `An unhandled exception occurred: Cannot find module 'webpack-dev-server' error.`
    ```shell
    $/cde/> rm -rf node_modules package-lock.json
    $/cde/> npm cache clean --force
    $/cde/> npm cache verify
    $/cde/> npm i
    ```

2. If your IDE encounters error:`'bash' is not recognized as an internal or external command,
operable program or batch file.
`
    ```shell
    $/cde/> npm config set script-shell "/c//tools//git//bin//bash.exe"
    ````

# Test
## Selenium
### Prerequisites 
* Selenium-Server-Standalone
* Chromedriver
* Java JRE
* Java JDK
* Intellij Community Edition

### Set up
(Note, in the following instructions, we make reference to something called PATH TO. Replace the "PATH TO"'s with the actual paths to the directories in question)

First, edit your bashrc file to include the following:
```
    alias hubStart='java -jar /c/PATH TO /selenium-server-standalone-2.53.0.jar -role hub'
    alias nodeStart='java -jar /c/PATH TO/selenium-server-standalone-2.53.0.jar -role node -maxSession 7 -hub http://localhost:4444/grid/register -browser browserName="chrome",maxInstances=7 -Dwebdriver.chrome.driver=/c/PATH TO/chromedriver.exe'
    export HUB_URL=http://localhost:4444/wd/hub
    export TEST_URL=http://localhost:4200
```

Next, open Intellij, create a new project rooted at C:\PATH TO\cde\test\selenium


### Running the tests
In the following order, run these commands, all of them either in their own terminals, or as a daemon:
1. `sh hubStart`
2. `sh nodeStart`     

Now, you need the app running in some way when you run the test.

We have included a script, start-test-instance.sh, that, in addition to running all the tests, also runs the app. We suggest that you use it.

(Don’t forget to have elastic and mongo running while you run the app, even if you are running it through he start-test-instance script)

If, for some reason, you don't want to use it (for example, if you just want to run one test), you will need to run the app before you can run any tests

### Code Coverage
Run in Bamboo and override variable "browser" with value "coverage"

### Setting Environment
Node and Angular environments needs to be dialed-in in unison in order to properly set the environment servers the application will use.

| NODE_ENV Environment | CLI Environment | Local Servers                      | Login Server  | Notes                        |
|----------------------|-----------------|------------------------------------|---------------|------------------------------|
| `default`            | `prod`          | NODE(3000)                         | uts-ws        |                              |
| `test`               | `test`          | NODE(3001)                         | uts-ws-qa     |                              |
| `test-local`         | `development`   | NODE(3001), login(3002)            | localhost CDE |                              |
| `test-ssl`           | `prod`          | NODE(3001)                         | uts-ws        | with HTTPS                   |
| `test-uts`           | `development`?  | NODE(3001), UTS(3000), UTS-X(4200) | localhost UTS | start UTS servers separately |

* Set Node
  * `NODE_ENV=<environment> npm start`
* Start local login server
  * `NODE_ENV=<environment> npm run testServer`
* Set Angular CLI Build
  * `"buildApp": "npx ng b cde-cli --configuration=<environment>",`
* Set Angular CLI Dev
  * `"devApp": "ng serve cde-cli --configuration=<environment>",`

## Playwright
### Running the tests
* npm run playwright:ui

# Code Maintenance
## Folder Structure
* Business Rules and Models go into __shared/__
* View Models and Angular-dependent code go into __modules/__
* Database entities and Node-dependent code go into __server/__
* node_modules overrides go into public repositories or __packages/__ (see section)

## API
API routes are created in Express using path __/api/__.
#### API Documentation via Swagger
Update route information in __swagger.yaml__. Restart the server to read it in.
Swagger-tools inserts its own route `/docs` using middleware and creates this page. The page is embedded using an __< iframe >__.

## Client
### CDE CSS Components (commons.scss)
* Arrows
  * <span class="keyboard-arrow left"></span>
* Checkbox
  * <input type="checkbox" class="checkbox"
* Button
  * <button class="button"
* Pill box
  * <span class="pill"
* USWDS implementations:
  * Card
  * `<div class="uswdsCard"></div>`
* Included styles h1-h6, .hero, .note, .subtitle

### Theming
#### Colors
Update theme.scss.
For custom angular colors extract the colors in common.scss by variable to theme.scss

## Entities
__Data Element__ and __Form__ have properties stored in multiple locations that need to be kept in sync.
* /server/_{entity}_/__schemas.ts__ (Mongoose type)
* /server/swagger/api/__swagger.yaml__ (API documentation)
* /shared/_{entity}_/_{entity}___.model.ts__ (TS type)
* /shared/_{entity}_/assets/_{entity}___.schema.json__ (JSON Schema)
* __(searchable properties or views only)__ /server/system/__elasticSearchInit.ts__ (ElasticSearch index mapping)

## Packages
### Create package:
1. Modify the external files.
2. Increment the version number. (npm stale files without clearing cache)
3. In the package directory, run: `npm pack`
4. Move the new archive __.tgz__ to __packages/__
5. Add to __package.json__: `"<package>": "file:packages/<package>-<version>.tgz",`
### Modify package:
1. Install the package (could be by `npm init` in __packages__): `npm i <package>-<version>.tgz`
2. Modify the package files.
3. Increment the version number. (npm stale files without clearing cache)
4. In the package directory, run: `npm pack`
5. Move the new archive __.tgz__ to __packages/__
### GitHub package:
1. Update GitHub with new version.
2. `npm pack`
3. Create a GitHub release and upload the __.tgz__ file.
4. Update package.json with new release URL.

## Single Sign-On (SSO)
Client __App Component__ silently loads UTS into an invisible __< iframe >__ and communicates with it to get the JWT for UTS login.
The configuration variable for the UTS messenger is __ssoServerReceiver__. 

# CDE Ingesters
For bulk loading new CDEs/Forms into the system a custom program called a loader must be written. To 
write and test a loader a connection to the QA environment from the local machine needs to be made.
This process requires multiple steps. More information can be found here: [Ingester README](ingester/README.md)
