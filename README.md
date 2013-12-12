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

        <p>ElasticSearch should be installed with the river for mongo plugin. <br>
            <a href="https://github.com/richardwilly98/elasticsearch-river-mongodb"/>
            <br>Versions numbers should match per river plugin doc. 
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
        
        With ElasticSearch running, execute the following to index mongodb.
        <br>
        <span>
            #!/bin/sh
            curl -XPUT "localhost:9200/_river/nlmcde_mongo_v1/_meta" -d'
            {
              "type": "mongodb",
                "mongodb": {
                  "db": "nlmcde", 
                  "collection": "dataelements",
                  "script": "if( ctx.document.archived) { ctx.deleted = true; }" 
                },
                "index": {
                  "name": "nlmcde_mongo_v1", 
                  "type": "documents"
                }           
            }'
        </span>
        <br>
        Create an alias with the following:
        <br>
        <span>
        POST to _aliases
        {
            "actions": [
                { "add": {
                    "alias": "nlmcde",
                    "index": "nlmcde_mongo_v1"
                }}
            ]
        }
        </span>
        <br>
        This will create an alias so that, when needed, a new index can be created in parallel, and the alias can be modified after indexing is complete. 
        
        <h1>Test</h1>
        Start the vsac mock with $> ./node-js/mock/vsacMock
        You may need to generate your own ssl server key. 

        To run the test suite $> ./start-test-instance.sh

        <h1>Seed</h1>
        To seed data $> ./upload.sh
        <br>
        To upload some forms: $> groovy UploadCadsrForms
        
        <h1>Run</h1>
        To run the app: $> node app
    </body>
</html>
