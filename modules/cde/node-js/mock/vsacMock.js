var path = require('path');

var express = require('express')
    , https = require('https')
    , http = require('http')
    , fs = require('fs')
    , config = require('../../../system/node-js/parseConfig')
    , bodyParser = require('body-parser')
    , cookieParser = require('cookie-parser')
    , session = require('express-session')
    , methodOverride = require('method-override')
    , morganLogger = require('morgan')
    ;

var app = express();

// all environments
app.set('port', config.vsac.port || 4000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(morganLogger('dev'));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(cookieParser('your secret here'));
app.use(session({ secret: 'omgnodeworks', resave: false, saveUninitialized: false}));

app.get('/vsac/ws/Ticket', function(req, res) {
    res.send("MOCKticket.");
});

app.post('/vsac/ws/Ticket', function(req, res) {
    res.send("MOCKticket.");
});

app.post('/vsac/ws/Ticket/:ticketId', function(req, res) {
    res.send("MOCKticket.");
});

app.get('/vsac/ws/RetrieveValueSet', function(req, res) {
    var key = req.query['id'];
    if (!fs.existsSync(path.join(__dirname, './vsac-data/' + key))) {
        res.status(404).send("The requested resource () is not available.");
    } else {
        fs.readFile(path.join(__dirname, './vsac-data/' + key), function(err, data) {
            if (err) {
                res.send("file is corrupt");
            } else {
                res.send(data);
            }
        });
    }
});

var umlsSearches = {
    "female": {"pageSize":25,"pageNumber":1,"result":{"classType":"searchResults","results":[{"ui":"C0015780","rootSource":"MTH","uri":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C0015780","name":"Female"},{"ui":"C0043210","rootSource":"MTH","uri":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C0043210","name":"Woman"},{"ui":"C0086287","rootSource":"MTH","uri":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C0086287","name":"Females"},{"ui":"C1705497","rootSource":"MTH","uri":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C1705497","name":"Female, Self-Report"},{"ui":"C1705498","rootSource":"MTH","uri":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C1705498","name":"Female Phenotype"},{"ui":"C0001588","rootSource":"MSH","uri":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C0001588","name":"Adolescents, Female"},{"ui":"C0009873","rootSource":"MSH","uri":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C0009873","name":"Contraceptive Agents, Female"},{"ui":"C0013394","rootSource":"MTH","uri":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C0013394","name":"Dyspareunia (female)"},{"ui":"C0015785","rootSource":"MSH","uri":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C0015785","name":"Inhibins, Female"},{"ui":"C0015787","rootSource":"MSH","uri":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C0015787","name":"Female Sterilization"},{"ui":"C0017421","rootSource":"MTH","uri":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C0017421","name":"Female genitalia"},{"ui":"C0021361","rootSource":"MTH","uri":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C0021361","name":"Female infertility"},{"ui":"C0025320","rootSource":"MTH","uri":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C0025320","name":"Menopause"},{"ui":"C0029936","rootSource":"MTH","uri":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C0029936","name":"Ovariectomy"},{"ui":"C0029939","rootSource":"MTH","uri":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C0029939","name":"Ovary"},{"ui":"C0029974","rootSource":"MTH","uri":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C0029974","name":"Ovum"},{"ui":"C0032961","rootSource":"MTH","uri":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C0032961","name":"Pregnancy"},{"ui":"C0033011","rootSource":"MSH","uri":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C0033011","name":"Pregnant Women"},{"ui":"C0042993","rootSource":"MTH","uri":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C0042993","name":"Vulva"},{"ui":"C0079341","rootSource":"MTH","uri":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C0079341","name":"Female Circumcision"},{"ui":"C0086286","rootSource":"MSH","uri":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C0086286","name":"Female Contraception"},{"ui":"C0150905","rootSource":"CHV","uri":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C0150905","name":"patient is female"},{"ui":"C0151752","rootSource":"MDR","uri":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C0151752","name":"Female lactation"},{"ui":"C0156419","rootSource":"SNOMEDCT_US","uri":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C0156419","name":"Female hematocele"},{"ui":"C0194606","rootSource":"SNOMEDCT_US","uri":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C0194606","name":"Female urethrorrhaphy"}]}}
};

var umlsAtoms = {
    "C0015780": {
        "NCI": {"pageSize":500,"pageNumber":1,"pageCount":1,"result":[{"classType":"Atom","ui":"A10768999","suppressible":"false","obsolete":"false","rootSource":"NCI","termType":"AB","code":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/source/NCI/C16576","concept":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C0015780","sourceConcept":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/source/NCI/C16576","sourceDescriptor":"NONE","attributes":"NONE","parents":"NONE","ancestors":null,"children":"NONE","descendants":null,"relations":"NONE","definitions":"NONE","name":"F","language":"ENG"},{"classType":"Atom","ui":"A10760885","suppressible":"false","obsolete":"false","rootSource":"NCI","termType":"SY","code":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/source/NCI/C46110","concept":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C0015780","sourceConcept":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/source/NCI/C46110","sourceDescriptor":"NONE","attributes":"NONE","parents":"NONE","ancestors":null,"children":"NONE","descendants":null,"relations":"NONE","definitions":"NONE","name":"Female","language":"ENG"},{"classType":"Atom","ui":"A7570536","suppressible":"false","obsolete":"false","rootSource":"NCI","termType":"PT","code":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/source/NCI/C16576","concept":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C0015780","sourceConcept":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/source/NCI/C16576","sourceDescriptor":"NONE","attributes":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/AUI/A7570536/attributes","parents":"NONE","ancestors":null,"children":"NONE","descendants":null,"relations":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/AUI/A7570536/relations","definitions":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/AUI/A7570536/definitions","name":"Female","language":"ENG"},{"classType":"Atom","ui":"A23970988","suppressible":"false","obsolete":"false","rootSource":"NCI","termType":"SY","code":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/source/NCI/TCGA","concept":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C0015780","sourceConcept":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/source/NCI/C16576","sourceDescriptor":"NONE","attributes":"NONE","parents":"NONE","ancestors":null,"children":"NONE","descendants":null,"relations":"NONE","definitions":"NONE","name":"Female","language":"ENG"},{"classType":"Atom","ui":"A23887023","suppressible":"false","obsolete":"false","rootSource":"NCI","termType":"SY","code":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/source/NCI/NHIS","concept":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C0015780","sourceConcept":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/source/NCI/C16576","sourceDescriptor":"NONE","attributes":"NONE","parents":"NONE","ancestors":null,"children":"NONE","descendants":null,"relations":"NONE","definitions":"NONE","name":"Female","language":"ENG"},{"classType":"Atom","ui":"A10805032","suppressible":"false","obsolete":"false","rootSource":"NCI","termType":"PT","code":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/source/NCI/C46110","concept":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C0015780","sourceConcept":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/source/NCI/C46110","sourceDescriptor":"NONE","attributes":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/AUI/A10805032/attributes","parents":"NONE","ancestors":null,"children":"NONE","descendants":null,"relations":"NONE","definitions":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/AUI/A10805032/definitions","name":"Female Gender","language":"ENG"},{"classType":"Atom","ui":"A10805031","suppressible":"false","obsolete":"false","rootSource":"NCI","termType":"SY","code":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/source/NCI/C46110","concept":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C0015780","sourceConcept":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/source/NCI/C46110","sourceDescriptor":"NONE","attributes":"NONE","parents":"NONE","ancestors":null,"children":"NONE","descendants":null,"relations":"NONE","definitions":"NONE","name":"Female Gender, Self Report","language":"ENG"},{"classType":"Atom","ui":"A10805030","suppressible":"false","obsolete":"false","rootSource":"NCI","termType":"SY","code":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/source/NCI/C46110","concept":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C0015780","sourceConcept":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/source/NCI/C46110","sourceDescriptor":"NONE","attributes":"NONE","parents":"NONE","ancestors":null,"children":"NONE","descendants":null,"relations":"NONE","definitions":"NONE","name":"Female Gender, Self Reported","language":"ENG"}]},
        "LNC": {"pageSize":500,"pageNumber":1,"pageCount":1,"result":[{"classType":"Atom","ui":"A24095561","suppressible":"false","obsolete":"false","rootSource":"LNC","termType":"LA","code":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/source/LNC/LA3-6","concept":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C0015780","sourceConcept":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/source/LNC/LA3-6","sourceDescriptor":"NONE","attributes":"NONE","parents":"NONE","ancestors":null,"children":"NONE","descendants":null,"relations":"NONE","definitions":"NONE","name":"Female","language":"ENG"}]},
        "SNOMEDCT_US": {"pageSize":500,"pageNumber":1,"pageCount":1,"result":[{"classType":"Atom","ui":"A2881557","suppressible":"false","obsolete":"false","rootSource":"SNOMEDCT_US","termType":"PT","code":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/source/SNOMEDCT_US/248152002","concept":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C0015780","sourceConcept":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/source/SNOMEDCT_US/248152002","sourceDescriptor":"NONE","attributes":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/AUI/A2881557/attributes","parents":"NONE","ancestors":null,"children":"NONE","descendants":null,"relations":"NONE","definitions":"NONE","name":"Female","language":"ENG"},{"classType":"Atom","ui":"A2881558","suppressible":"false","obsolete":"false","rootSource":"SNOMEDCT_US","termType":"SY","code":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/source/SNOMEDCT_US/1086007","concept":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C0015780","sourceConcept":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/source/SNOMEDCT_US/1086007","sourceDescriptor":"NONE","attributes":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/AUI/A2881558/attributes","parents":"NONE","ancestors":null,"children":"NONE","descendants":null,"relations":"NONE","definitions":"NONE","name":"Female","language":"ENG"},{"classType":"Atom","ui":"A3453091","suppressible":"false","obsolete":"false","rootSource":"SNOMEDCT_US","termType":"FN","code":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/source/SNOMEDCT_US/248152002","concept":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C0015780","sourceConcept":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/source/SNOMEDCT_US/248152002","sourceDescriptor":"NONE","attributes":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/AUI/A3453091/attributes","parents":"NONE","ancestors":null,"children":"NONE","descendants":null,"relations":"NONE","definitions":"NONE","name":"Female (finding)","language":"ENG"},{"classType":"Atom","ui":"A2877558","suppressible":"false","obsolete":"false","rootSource":"SNOMEDCT_US","termType":"SY","code":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/source/SNOMEDCT_US/1086007","concept":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C0015780","sourceConcept":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/source/SNOMEDCT_US/1086007","sourceDescriptor":"NONE","attributes":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/AUI/A2877558/attributes","parents":"NONE","ancestors":null,"children":"NONE","descendants":null,"relations":"NONE","definitions":"NONE","name":"Female individual","language":"ENG"},{"classType":"Atom","ui":"A3453356","suppressible":"false","obsolete":"false","rootSource":"SNOMEDCT_US","termType":"PT","code":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/source/SNOMEDCT_US/1086007","concept":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C0015780","sourceConcept":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/source/SNOMEDCT_US/1086007","sourceDescriptor":"NONE","attributes":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/AUI/A3453356/attributes","parents":"NONE","ancestors":null,"children":"NONE","descendants":null,"relations":"NONE","definitions":"NONE","name":"Female structure","language":"ENG"},{"classType":"Atom","ui":"A3453355","suppressible":"false","obsolete":"false","rootSource":"SNOMEDCT_US","termType":"FN","code":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/source/SNOMEDCT_US/1086007","concept":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/CUI/C0015780","sourceConcept":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/source/SNOMEDCT_US/1086007","sourceDescriptor":"NONE","attributes":"https://uts-ws.nlm.nih.gov/rest/content/2015AB/AUI/A3453355/attributes","parents":"NONE","ancestors":null,"children":"NONE","descendants":null,"relations":"NONE","definitions":"NONE","name":"Female structure (body structure)","language":"ENG"}]}
    },
    "C1515945": {
        "SNOMEDCT_US": {"pageSize":500,"pageNumber":1,"pageCount":1,"result":[{"classType":"Atom","ui":"A7879317","suppressible":"false","obsolete":"false","rootSource":"SNOMEDCT_US","termType":"PT","code":"https://uts-ws.nlm.nih.gov/rest/content/2016AA/source/SNOMEDCT_US/413490006","concept":"https://uts-ws.nlm.nih.gov/rest/content/2016AA/CUI/C1515945","sourceConcept":"https://uts-ws.nlm.nih.gov/rest/content/2016AA/source/SNOMEDCT_US/413490006","sourceDescriptor":"NONE","attributes":"https://uts-ws.nlm.nih.gov/rest/content/2016AA/AUI/A7879317/attributes","parents":"NONE","ancestors":null,"children":"NONE","descendants":null,"relations":"NONE","definitions":"NONE","name":"American Indian or Alaska native","language":"ENG"},{"classType":"Atom","ui":"A7879314","suppressible":"false","obsolete":"false","rootSource":"SNOMEDCT_US","termType":"FN","code":"https://uts-ws.nlm.nih.gov/rest/content/2016AA/source/SNOMEDCT_US/413490006","concept":"https://uts-ws.nlm.nih.gov/rest/content/2016AA/CUI/C1515945","sourceConcept":"https://uts-ws.nlm.nih.gov/rest/content/2016AA/source/SNOMEDCT_US/413490006","sourceDescriptor":"NONE","attributes":"https://uts-ws.nlm.nih.gov/rest/content/2016AA/AUI/A7879314/attributes","parents":"NONE","ancestors":null,"children":"NONE","descendants":null,"relations":"NONE","definitions":"NONE","name":"American Indian or Alaska native (racial group)","language":"ENG"}]},
        "LNC": {"pageSize":500,"pageNumber":1,"pageCount":1,"result":[{"classType":"Atom","ui":"A24098846","suppressible":"false","obsolete":"false","rootSource":"LNC","termType":"LA","code":"https://uts-ws.nlm.nih.gov/rest/content/2016AA/source/LNC/LA10608-0","concept":"https://uts-ws.nlm.nih.gov/rest/content/2016AA/CUI/C1515945","sourceConcept":"https://uts-ws.nlm.nih.gov/rest/content/2016AA/source/LNC/LA10608-0","sourceDescriptor":"NONE","attributes":"NONE","parents":"NONE","ancestors":null,"children":"NONE","descendants":null,"relations":"NONE","definitions":"NONE","name":"American Indian or Alaska Native","language":"ENG"},{"classType":"Atom","ui":"A24101524","suppressible":"false","obsolete":"false","rootSource":"LNC","termType":"LA","code":"https://uts-ws.nlm.nih.gov/rest/content/2016AA/source/LNC/LA6155-1","concept":"https://uts-ws.nlm.nih.gov/rest/content/2016AA/CUI/C1515945","sourceConcept":"https://uts-ws.nlm.nih.gov/rest/content/2016AA/source/LNC/LA6155-1","sourceDescriptor":"NONE","attributes":"NONE","parents":"NONE","ancestors":null,"children":"NONE","descendants":null,"relations":"NONE","definitions":"NONE","name":"American Indian or Alaska Native","language":"ENG"}]}
    }
};

var umlsFromSrc = {
    "c41259": {"pageSize":25,"pageNumber":1,"result":{"classType":"searchResults","results":[{"ui":"C1515945","rootSource":"MTH","uri":"https://uts-ws.nlm.nih.gov/rest/content/2016AA/CUI/C1515945","name":"American Indian or Alaska Native"}]}}
};

// FAKE UMLS requests
app.get('/rest/search/current', function(req, res) {
    var str = req.query.string.toLowerCase();
    if (req.query.inputType === "sourceUi") {
        res.send(JSON.stringify(umlsFromSrc[str]));
    } else {
        res.send(JSON.stringify(umlsSearches[str]));
    }
});

app.get('/rest/content/current/CUI/:cui/atoms', function(req, res) {
    var cui = req.params.cui;
    var src = req.query.sabs;
    res.send(JSON.stringify(umlsAtoms[cui][src]));
});

// Mocks UTS ticket validation process
app.post('/cas/serviceValidate', function(req, res) {
    if( req.query.ticket === 'invalid' ) {
        res.send("<cas:serviceResponse xmlns:cas='http://www.yale.edu/tp/cas'> <cas:authenticationFailure code='INVALID_TICKET'>ticket &#039;ST-430048-3Em71CBricwWoL7bd5nc-cas&#039; not recognized </cas:authenticationFailure></cas:serviceResponse>");
    } else if( req.query.ticket === 'valid' ) {
        res.send("<cas:serviceResponse xmlns:cas='http://www.yale.edu/tp/cas'> <cas:authenticationSuccess> <cas:user>ninds</cas:user> </cas:authenticationSuccess> </cas:serviceResponse>");
    } else if( req.query.ticket === 'timeout1' ) {
        // Return after 1 sec, ticket validation times out after 2 sec, ticket validation passes
        setTimeout(function() {
            res.send("<cas:serviceResponse xmlns:cas='http://www.yale.edu/tp/cas'> <cas:authenticationSuccess> <cas:user>ninds</cas:user> </cas:authenticationSuccess> </cas:serviceResponse>");
        }, 1000);
    } else if( req.query.ticket === 'timeout4' ) {
        // Return after 4 sec, ticket validation times out after 2 sec, ticket validation doesn't pass
        setTimeout(function() {
            res.send("<cas:serviceResponse xmlns:cas='http://www.yale.edu/tp/cas'> <cas:authenticationSuccess> <cas:user>ninds</cas:user> </cas:authenticationSuccess> </cas:serviceResponse>");
        }, 4000);
    }
});

var options = {
  key: fs.readFileSync(path.join(__dirname, './server.key')),
  cert: fs.readFileSync(path.join(__dirname, './server.crt'))
};

https.createServer(options, app).listen(app.get('port'), function(){
  console.log('HTTPS Mock listening on port: ' + app.get('port'));
});

var net = require('net');
var server = net.createServer(function(c) { 
    var malicious = false;
    console.log('Scan connection started');
    var file = new Buffer(1024*1024*5);
    c.on('data', function(data) {
        file += data;

        var array = JSON.parse(JSON.stringify(data));
        try {
            var last4;
            if (array.data) last4 = array.data.slice(-4);
            else last4 = array.slice(-4);
            if (last4.length < 4) return;
            for (var i = 0; i < 3; i++) if (last4[i] !== 0) return;

            if (file.toString().indexOf("VIRUS") > -1) {
                malicious = true;
                console.log("setting malicious = true");
            }

            if (malicious) console.log("stream: A FOUND\n");
            else console.log("stream: OK\n");

            if (malicious) c.write("stream: A FOUND\n");
            else c.write("stream: OK\n");
        } catch (e) {
            if (malicious) console.log("stream: A FOUND\n");
            else console.log("stream: OK\n");

            if (malicious) c.write("stream: A FOUND\n");
            else c.write("stream: OK\n");
        }
    });
    c.on("end", function() {
        console.log("Scan connection closed");
    });
    c.on("error", function(err) {
        console.log(err);
    });    
});
server.listen(config.antivirus.port, function() { 
    console.log('ClamAV Fake daemon open on port: ' + config.antivirus.port);
});