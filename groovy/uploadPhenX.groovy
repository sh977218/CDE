@Grab(group='org.mongodb', module='mongo-java-driver', version='2.11.1')
@Grab('net.sourceforge.htmlunit:htmlunit:2.7')

import com.mongodb.*;
import com.mongodb.util.JSON;
import org.xml.sax.InputSource;
import com.gargoylesoftware.htmlunit.*
import com.gargoylesoftware.htmlunit.html.*


def baseFileDir = args[0];
def mongoHost = args[1];
def mongoDb = args[2];
def password = args[3];

if(mongoHost == null || mongoDb == null || password == null)  {
    println "Please specify mongodb host and dbname: 'groovy UploadPhenX.groovy [filename] [mongodb-host] [dbname] [password]'";
    System.exit(0);
} else {
    println "MongoDB host: " + mongoHost + ", db: " + mongoDb
}

def idUtils = new IdUtils();
def siteRootAdmin = "siteRootAdmin";
def authDB = "admin";

MongoCredential credential = MongoCredential.createMongoCRCredential(siteRootAdmin, authDB, password.toCharArray());

MongoClient mongoClient = new MongoClient( Arrays.asList(new ServerAddress(mongoHost, 27017)), Arrays.asList(credential),);
DB db = mongoClient.getDB(mongoDb);

DBCollection deColl = db.getCollection("dataelements");
DBCollection orgColl = db.getCollection("orgs");
DBCollection cacheColl = db.getCollection("phenxcache");


addProperty = {match, key, value ->
    BasicDBObject newProp = new BasicDBObject("key", key);
    newProp.put("value", value);
    newProp.put("valueFormat", "html");
    DBObject updateQuery = new BasicDBObject("\$push", new BasicDBObject("properties", newProp));
    deColl.update(match, updateQuery);
}

doPage = {thisFile ->

    def webClient = new WebClient();

    
    def url = "file:///" + thisFile.canonicalPath;
    println "processing : " + url;
    
    def pageAsString;
    println url;
    
    def page = webClient.getPage(url);
    
    def allTrs = page.getByXPath("//div[@id='element_STANDARDS']/p/table/tbody/tr");

    def cadsrIds = [];
    def loincId = "";
    for (def thisTr : allTrs) {
        def allTds = thisTr.getByXPath("td");
        if (allTds.size() > 0) {
            if (allTds[0].getTextContent().equals("Common Data Elements (CDE)")) {
                cadsrIds.push(allTds[2].getTextContent())
            } 
            if (allTds[0].getTextContent().equals("Logical Observation Identifiers Names and Codes (LOINC)")) {
                loincId = allTds[2].getTextContent();
            } 
        }
    }
    
    def protocolText = page.getByXPath("//div[@id='element_PROTOCOL_TEXT']")[0].asXml().replace("<div style=\"display:block\" id=\"element_PROTOCOL_TEXT\">\n  ", "")
                .replace("</div>\n", "")
                .replace("toolkit_content/thumb", "https://www.phenxtoolkit.org/toolkit_content/thumb")
                .replace("toolkit_content/report", "https://www.phenxtoolkit.org/toolkit_content/report")                    
                ;
    def protocolDescription = page.getByXPath("//div[@id='element_DESCRIPTION']/p")[0].getTextContent();
    def specificInstruction = page.getByXPath("//div[@id='element_SPECIFIC_INSTRUCTIONS']/p")[0].getTextContent();
    def selectionRationale = page.getByXPath("//div[@id='element_SELECTION_RATIONALE']/p")[0].getTextContent();
    def requirements = page.getByXPath("//div[@id='element_REQUIREMENTS']/p")[0].getTextContent();
    
    if (cadsrIds.size() != 1) println "caDSR IDS: " + cadsrIds.size()
    
    if (cadsrIds.size == 0) {
        println "NOTHING TO PROCESS, NO CADSR ID";
        return;
    }
    
    for (def thisId : cadsrIds) {
        BasicDBObject eleMatch = new BasicDBObject();
        eleMatch.put("source", "caDSR");
        eleMatch.put("id", thisId);
        BasicDBObject idMatch = new BasicDBObject("ids", new BasicDBObject("\$elemMatch", eleMatch))
            .append("source", "caDSR");
        
        def existingCde = deColl.findOne(idMatch);
        
        if (existingCde == null) {
            println "missing CDE";
        } else {
            
            println "******************************* " + existingCde.get("tinyId");
            
            addProperty(idMatch, "PhenX Protocol Text", protocolText);
            addProperty(idMatch, "PhenX Protocol Description", protocolDescription);
            addProperty(idMatch, "PhenX Specific Instruction", specificInstruction);
            addProperty(idMatch, "PhenX Selection Rationale", selectionRationale);
            addProperty(idMatch, "PhenX Requirements", requirements);
            
            // if there are more than one caDSR ID, LOINC ID mapping is to panel, so we can't map to LOINC element
            if (cadsrIds.size == 1) {
                BasicDBObject newId = new BasicDBObject("source", "LOINC");
                newId.put("id", loincId);
                DBObject updateQuery = new BasicDBObject("\$push", new BasicDBObject("ids", newId));
                deColl.update(idMatch, updateQuery);
            }
            
        }
    }    
}

def baseFolder = new File(baseFileDir);
files = baseFolder.listFiles();
for (def thisFile : files) {
    if (thisFile.canonicalPath.contains("browse.protocoldetails") && !thisFile.canonicalPath.contains("tree=off"))
    doPage(thisFile);
}   

