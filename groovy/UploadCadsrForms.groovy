@Grab(group='org.mongodb', module='mongo-java-driver', version='2.11.1')

import com.mongodb.*;
import java.text.SimpleDateFormat

MongoClient mongoClient = new MongoClient( "localhost" );
String dbName = args.contains("--testMode")?"test":"nlmcde"; 
DB db = mongoClient.getDB(dbName);

DBCollection cacheColl = db.getCollection("cadsrCache");
DBCollection formColl = db.getCollection("forms");
DBCollection deColl = db.getCollection("dataelements");


def startUrl = "http://cadsrapi.nci.nih.gov/cadsrapi40/GetXML?query=Form&Form[@workflowStatusName=RELEASED]&pageSize=200&resultCounter=200";

SimpleDateFormat dateFormat = new SimpleDateFormat("MM-dd-yyyy")

getContent = {urlStr ->
    def searchObj = new BasicDBObject("url", urlStr);
    DBObject resultDoc = cacheColl.findOne(searchObj)
    if (resultDoc == null) {
        println "Not in cache"
        def url = new URL(urlStr)
        def connection = url.openConnection()
        connection.setRequestMethod("GET")
        connection.connect()
        def returnMessage = ""
        result = connection.content.text;
        BasicDBObject newResult = new BasicDBObject("url", urlStr).append("value", result);
        cacheColl.insert(newResult);
    } else {
        result = resultDoc.get("value"); 
    }
    result
}

getField = {node, fieldName ->
    def result = node.field.findAll{it.'@name'.equals(fieldName)}
    result;
}

getFieldHref = {node, fieldName ->
    def result = node.field.findAll{it.'@name'.equals(fieldName)}.'@xlink:href'
    result;
}

doDataElement = {url ->
    def de = new XmlSlurper().parseText(getContent(url.toString())).declareNamespace(xlink: 'http://www.w3.org/1999/xlink').queryResponse.'class'[0]
    
    BasicDBObject deObj = new BasicDBObject();
    def deId = getField(de, 'publicID').toString()
    def deVersion = getField(de, 'version').toString()
    if (deVersion.endsWith('.0')) {
        deVersion = deVersion.substring(0, deVersion.lastIndexOf("."));
    }
    
    def foundDe = deColl.findOne(new BasicDBObject("originId", deId + 'v' + deVersion))
    if (foundDe == null) {
        deObj.append("description", "Data Element cannot be found. Origin: " + deId + 'v' + deVersion)
    } else  {
        deObj.append("de_uuid", foundDe.get("uuid"))        
        def findObj = new BasicDBObject("_id", foundDe.get('_id'))
        def incWhat = new BasicDBObject("formUsageCounter", 1)
        def incObj = new BasicDBObject("\$inc", incWhat)
        deColl.update(findObj, incObj)
    }
    deObj;
}

doQuestions = {url -> 
    def questionArray = []
    
    def httpQuery = new XmlSlurper().parseText(getContent(url.toString())).declareNamespace(xlink: 'http://www.w3.org/1999/xlink')
    for (q in httpQuery.queryResponse.'class') {
        BasicDBObject questionObj = new BasicDBObject("name", getField(q, 'longName').toString());
        questionObj.append("dataElement", doDataElement(getFieldHref(q, 'dataElement')));
        questionArray.add(questionObj);
    }
    
    questionArray
}

doModules = {url -> 
    def httpQuery = new XmlSlurper().parseText(getContent(url.toString())).declareNamespace(xlink: 'http://www.w3.org/1999/xlink')   
    
    def modArray = []
    
    for (m in httpQuery.queryResponse.'class') {   
        BasicDBObject moduleObj = new BasicDBObject("name", getField(m, 'longName').toString());
        moduleObj.append("questions", doQuestions(getFieldHref(m, 'questionCollection')));        
        modArray.add(moduleObj)
    }
    
    modArray
}

doContext = {url, formObj ->
    def httpQuery = new XmlSlurper().parseText(getContent(url.toString())).declareNamespace(xlink: 'http://www.w3.org/1999/xlink')   

    BasicDBObject orgObj = new BasicDBObject("name", getField(httpQuery.queryResponse.'class', 'name').toString());

    
    formObj.append("stewardOrg", orgObj );
}

doForm = {form ->
    BasicDBObject formObj = new BasicDBObject('name', getField(form, 'longName').toString())
    
    doContext(getFieldHref(form, 'context'), formObj)
    formObj.append("modules", doModules(getFieldHref(form, 'moduleCollection')))
    formObj.append("created", dateFormat.parse(getField(form, 'dateCreated').toString()))
    
    def actualStatus = getField(form, 'workflowStatusName').toString()
    def targetStatus = ''
    if (actualStatus.equals('RELEASED')) {
        targetStatus = 'Internally Reviewed'
    }
    BasicDBObject regState = new BasicDBObject();
    regState.append("registrationStatus", targetStatus)
    formObj.append("registrationState", regState);
    
    // Store form in MONGO
    formColl.insert(formObj);
    
}

doFormPage = {formUrl ->
    def content = getContent(formUrl.toString());
    def httpQuery = new XmlSlurper().parseText(content).declareNamespace(xlink: 'http://www.w3.org/1999/xlink')
        
    def next = httpQuery.queryResponse.next[0];
 
    
    def pageProgress = 0
    for (f in httpQuery.queryResponse.'class') {
        println (pageProgress++ / 2) + '%' 
        doForm(f);
    }
     
    // return a next link, if any.
    def result = null;
    if (next != null) {
        result = next.'@xlink:href'
    }
    result;
}

def nextPage = startUrl;
println "testMode: " + args.contains("--testMode");
while (nextPage != null) {
    println "Next Page " + nextPage;
    nextPage = doFormPage(nextPage);
    if (args.contains("--testMode")) {
        nextPage = null;
    }
}
