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

if(mongoHost == null || mongoDb == null)  {
    println "Please specify mongodb host and dbname: 'groovy UploadCadsr.groovy [filename] [mongodb-host] [dbname]'";
    System.exit(0);
} else {
    println "MongoDB host: " + mongoHost + ", db: " + mongoDb
}

def idUtils = new IdUtils();

MongoClient mongoClient = new MongoClient( mongoHost );
DB db = mongoClient.getDB(mongoDb);

DBCollection deColl = db.getCollection("dataelements");
DBCollection orgColl = db.getCollection("orgs");
DBCollection cacheColl = db.getCollection("phenxcache");

def webClient = new WebClient();

doPage = {thisFile ->

    def url = "file:///" + thisFile.canonicalPath;
    println "processing : " + url;
    
    def pageAsString;
    println url;
    
    def page = webClient.getPage(url);
    pageAsString = page.asXml();
    
    final HtmlDivision standardsDiv = page.getHtmlElementById("element_STANDARDS");

    def allTrs = standardsDiv.getByXPath("p/table/tbody/tr");

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
//        def cdeTitle = standardsDiv.getByXPath("p/table/tbody/tr[2]/td[1]")[0];
//        def loincTitle = div.getByXPath("p/table/tbody/tr[3]/td[1]")[0];
    }
    
    def protocolText = page.getByXPath("//div[@id='element_PROTOCOL_TEXT']")[0].asXml().replace("<div style=\"display:block\" id=\"element_PROTOCOL_TEXT\">\n  ", "")
                .replace("</div>\n", "")
                .replace("toolkit_content/thumb", "https://www.phenxtoolkit.org/toolkit_content/thumb")
                .replace("toolkit_content/report", "https://www.phenxtoolkit.org/toolkit_content/report")                    
                ;
    def protocolDescription = page.getByXPath("//div[@id='element_DESCRIPTION']/p")[0].getTextContent();
    
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
//        .append("source", "caDSR");
        
        def existingCde = deColl.findOne(idMatch);
        
        if (existingCde == null) {
            println "missing CDE";
        } else {
            println "^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ GO ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^" + existingCde.tinyId;
            BasicDBObject newProp = new BasicDBObject("key", "PhenX_Protocol_Text");
            newProp.put("value", protocolText);
            newProp.put("valueFormat", "html");
            DBObject updateQuery = new BasicDBObject("\$push", new BasicDBObject("properties", newProp));
            deColl.update(idMatch, updateQuery);
        }
    }
    
//    DBObject newDE = new BasicDBObject();
//    
//    def concepts = new ArrayList();
//    def loincConcept = new BasicDBObject();
//    loincConcept.append("name", div.getByXPath("p/table/tbody/tr[3]/td[2]")[0].getTextContent());
//    loincConcept.append("origin", "LOINC");
//    loincConcept.append("originId", div.getByXPath("p/table/tbody/tr[3]/td[3]")[0].getTextContent());
//    concepts.add(loincConcept);
//
//    newDE.append("\$set", new BasicDBObject().append("dataElementConcept.concepts", concepts));
//
//    newDE.append("\$set", new BasicDBObject().append("property.concepts", []));
//    newDE.append("\$set", new BasicDBObject().append("objectClass.concepts", []));
//
//    def protText = page.getByXPath("//div[@id='element_PROTOCOL_TEXT']")[0].asXml();
//    newDE.append("\$set", new BasicDBObject().append("protocolText", 
//        protText.replace("<div style=\"display:block\" id=\"element_PROTOCOL_TEXT\">\n  ", "").replace("</div>\n", "")
//            .replace("toolkit_content/thumb", "https://www.phenxtoolkit.org/toolkit_content/thumb")
//            .replace("toolkit_content/report", "https://www.phenxtoolkit.org/toolkit_content/report")                    
//            ));        
//
//    def protDesc = page.getByXPath("//div[@id='element_DESCRIPTION']/p")[0].getTextContent();
//    
//    newDE.append("\$set", new BasicDBObject().append("protocolDescription", phenXObj.get("protocolDescription")));        
//    newDE.append("\$set", new BasicDBObject().append("registrationState.registrationStatus", "Standard"));
//    
//    deColl.insert(newDE);
}

def baseFolder = new File(baseFileDir);
files = baseFolder.listFiles();
for (def thisFile : files) {
    if (thisFile.canonicalPath.contains("browse.protocoldetails"))
    doPage(thisFile);
}   

