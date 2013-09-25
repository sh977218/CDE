<html>
    <body>
        <h1>Install</h1>
        <ul>Prerequisites
            <li>Java</li>
            <li>Node.js</li>
            <li>Gradle</li>
            <li>Groovy</li>
            <li>Mongodb</li>
        </ul>
        
        <h1>Configure</h1>
        Set these environment variables:<br>
        MONGOHQ_URL=mongodb://mongo_username:mongo_passwrod@mongo_host:mongo_port/db_name
        <br>
        VSAC_USERNAME=
        <br>
        VSAC_PASSWORD=

        
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
