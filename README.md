<html>
    <body>
        <h1>Install</h1>
        <ul>Prerequisites
            <li>Java</li>
            <li>Node.js</li>
            <li>Gradle</li>
            <li>Groovy</li>
            <li>Mongodb</li>
            <li>ElasticSearch</li>
            <li>Elastic River for MongoDB</li>
        </ul>

        <p>ElasticSearch should be installed with the river for mongo plugin. <br/>
            <div>$> wget https://download.elasticsearch.org/elasticsearch/elasticsearch/elasticsearch-0.90.7.tar.gz</div>
            <div> configure elascticsearch.yml 
                <ul>
                    <li>path.data</li>
                    <li>path.work</li>
                    <li>path.logs</li>
                    <li>plugin.mandatory: mapper-attachments, lang-javascript, river-mongodb
                </ul>
            </div>
            <a href="https://github.com/richardwilly98/elasticsearch-river-mongodb"/>
            <div> bin/plugin --install com.github.richardwilly98.elasticsearch/elasticsearch-river-mongodb/1.7.3 </div>
            <br/>Versions numbers should match per river plugin doc. 
            <br/>
            Install javascript plugin
            bin/plugin -install elasticsearch/elasticsearch-lang-javascript/1.4.0
            <br/>
            Install mapper attachment plugin
            bin/plugin -install elasticsearch/elasticsearch-mapper-attachments/1.6.0
            </p>
        
        <h1>Configure</h1>
        Set these environment variables:<br>
        MONGOHQ_URL=mongodb://mongo_username:mongo_passwrod@mongo_host:mongo_port/db_name
        <br>
        VSAC_USERNAME=
        <br>
        VSAC_PASSWORD=
        <br>
        LOGDIR=
        <br>
        ELASTIC_URI
        <br>
        It's also possible to set the variables in envconfig.js
        <span>
            var envconfig = {
                vsac: {
                    username: 'abc'
                    , password: '123'
                    , host: 'vsac-qa.nlm.nih.gov'
                }
                , logdir: /var/log
                , elasticUri: http://localhost:9200/nlmcde/
            };
        </span>
        
        <h2>Configure Elastic Search</h2>
        <br>MongoDB must run in Replicate mode. For example
        <br>mongod --replSet rs0
        
        With ElasticSearch running, execute the following to create an index:
        <br>
        <span>
            $> ./scripts/elasticsearch/createIndex.sh
        </span>
        <br>
        Next, create a river for data to flow from Mongo to ElasticSearch. 
        You may need to edit the content of the file to point to the proper DB, in which case, you can make a local copy of this file.
        <span>
            $> ./scripts/elasticsearch/createRiver.sh
        </span>
        <br>
        Finally, create an alias for the index. Alternatively, you can name the index nlmcde and not use aliases. The script removes a previous alias and adds a new one, 
        this will fail if the alias doesn't already exist. Edit a local copy as needed.  
        <span>
           $> ./scripts/elasticsearch/aliasUpdate.sh 
        </span>
        <br>
        Create an alias with the following:
        <br>
        <span>
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
        </span>
        <br>
        This will create an alias so that, when needed, a new index can be created in parallel, and the alias can be modified after indexing is complete. 
        
        <h1>Test</h1>
        Start the vsac mock with $> ./node-js/mock/vsacMock
        You may need to generate your own ssl server key. 

        <br>
        Download ChromeDriver, possibly from here:
        <a href="https://code.google.com/p/chromedriver/downloads/list"></a>
        <br>
        Move the chromedriver executable into test/selenium.
        <br><small>You may try testing with Firefox but Selenium is bad with Firefox. At this time, version 24 seems ok, but not version 26.</small>
        
        <br>
        To run the test suite $> ./start-test-instance.sh

        <h1>Seed</h1>
        To seed data $> ./upload.sh
        <br>
        To upload some forms: $> groovy UploadCadsrForms
        
        <h1>Run</h1>
        To run the app: $> node app
    </body>
</html>
