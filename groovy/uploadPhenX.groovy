@Grab(group='org.mongodb', module='mongo-java-driver', version='2.11.1')
@Grab('net.sourceforge.htmlunit:htmlunit:2.7')

import com.mongodb.*;
import com.mongodb.util.JSON;
import org.xml.sax.InputSource;
import com.gargoylesoftware.htmlunit.*
import com.gargoylesoftware.htmlunit.html.*


def baseFileDir = args[0];
def mongoHost = args[1];
def mongoDb = args[0];

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

//def startUrl = "https://www.phenxtoolkit.org/index.php?pageLink=browse.measures&tree=off";
//println "grabbing start page"
//def startPage = webClient.getPage(startUrl);
//println "done"

doPage = {thisFile ->

    def url = "file:///" + thisFile.canonicalPath;
    
    
    println "processing : " + url;
    
    def pageAsString;
//    def url = 'https://www.phenxtoolkit.org/index.php?pageLink=browse.protocoldetails&id=' + thisId;
    
    println url;
    
    def page = webClient.getPage(url);
    pageAsString = page.asXml();
    
    final HtmlDivision div = page.getHtmlElementById("element_STANDARDS");

    def cdeTitle = div.getByXPath("p/table/tbody/tr[2]/td[1]")[0];
    def loincTitle = div.getByXPath("p/table/tbody/tr[3]/td[1]")[0];
    
    println "Protocol Text: " + page.getByXPath("//div[@id='element_PROTOCOL_TEXT']")[0].asXml();
    
    
    
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

