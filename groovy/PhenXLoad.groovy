@Grab('net.sourceforge.htmlunit:htmlunit:2.7')
@Grab(group='org.mongodb', module='mongo-java-driver', version='2.11.1')

import com.gargoylesoftware.htmlunit.WebClient
import com.gargoylesoftware.htmlunit.html.HtmlDivision
import com.mongodb.*;
import java.text.SimpleDateFormat
import java.util.regex.Pattern

MongoClient mongoClient = new MongoClient( "localhost" );
String dbName = args.contains("--testMode")?"test":"nlmcde"; 
DB db = mongoClient.getDB(dbName);

DBCollection mapColl = db.getCollection("phenXMap");
DBCollection deColl = db.getCollection("dataelements");

def webClient = new WebClient();


if (args.contains("--protIds")) {
    def startUrl = "file:///usr/nlm/cde/code/nlm-seed/phenxtoolkit_report_112113.html";
    def startPage = webClient.getPage(startUrl);

    def allTables = startPage.getByXPath("//table");
    def totalSize = allTables.size();
    def count = 0;
    for (def table : allTables) {
        println (count++ / totalSize*100) 
        def protIdTitleCell = table.getByXPath("tbody/tr[2]/td[1]") 
        if (protIdTitleCell.size() > 0
            && protIdTitleCell[0].getTextContent().trim().equals("Protocol Id")) {
            BasicDBObject phenXObj = new BasicDBObject();
            phenXObj.append("protocolId", table.getByXPath("tbody/tr[2]/td[2]")[0].getTextContent().trim());
            mapColl.insert(phenXObj);
        }
    }
}




doPage = {phenXObj ->
    
    def cache = new File("../nlm-seed/cache/" + phenXObj.get("protocolId"));
    def url = "file:///usr/nlm/cde/code/nlm-seed/cache/" + phenXObj.get("protocolId");
    if (!cache.exists()) {
        url = 'https://www.phenxtoolkit.org/index.php?pageLink=browse.protocoldetails&id=' + phenXObj.get("protocolId");
        println "Page not in cache: " + url;
        }
    
    println "getting: " + url
    def page = webClient.getPage(url);

    if (!cache.exists()) {
        page.printXml(" ", new PrintWriter(cache));
    }
    
    final HtmlDivision div = page.getHtmlElementById("element_STANDARDS");

    def cdeTitle = div.getByXPath("p/table/tbody/tr[2]/td[1]")[0];
    def loincTitle = div.getByXPath("p/table/tbody/tr[3]/td[1]")[0];

    if (cdeTitle == null || !cdeTitle.getTextContent().equals("Common Data Elements (CDE)")) {
        println "unexpected format. No CDE title for : " + url;
    } else if (loincTitle == null || !loincTitle.getTextContent().equals("Logical Observation Identifiers Names and Codes (LOINC)")) {
        println "unexpected format. No Loinc title for : " + url;
        println "actual content: " + loincTitle;
    } else {
        phenXObj.append("cadsrId", div.getByXPath("p/table/tbody/tr[2]/td[3]")[0].getTextContent());
        phenXObj.append("loincName", div.getByXPath("p/table/tbody/tr[3]/td[2]")[0].getTextContent());
        phenXObj.append("loincId", div.getByXPath("p/table/tbody/tr[3]/td[3]")[0].getTextContent());
    }
    
    phenXObj.append("protocolDescription", page.getByXPath("//div[@id='element_DESCRIPTION']/p")[0].getTextContent());
    phenXObj.append("protocolText", page.getByXPath("//div[@id='element_PROTOCOL_TEXT']")[0].asXml())

    BasicDBObject findObj = new BasicDBObject();
    findObj.put("_id", phenXObj.get("_id"));

    mapColl.update(findObj, phenXObj);
    
}

if (args.contains("--map")) {
    recList = mapColl.find();
    def totalSize = recList.size();
    def count = 0;
    for (DBObject record : recList ) {
        print (count++ / totalSize*100) + " ";
        doPage(record);
    }
}

mergeRecord = {phenXObj ->
    def findObj = new BasicDBObject("originId", Pattern.compile("^" + phenXObj.get("cadsrId") + "v"));
    
    DBObject toUpdate = deColl.findOne(findObj)
    
    if (toUpdate != null) {
        println toUpdate.get("naming");
        def concepts = new ArrayList();
        def loincConcept = new BasicDBObject();
        loincConcept.append("name", phenXObj.get("loincName"));
        loincConcept.append("origin", "LOINC");
        loincConcept.append("originId", phenXObj.get("loincId"));
        concepts.add(loincConcept);

        findObj = new BasicDBObject("_id", toUpdate.get("_id"));

        def newDocument = new BasicDBObject();
        newDocument.append("\$set", new BasicDBObject().append("objectClass.concepts", concepts));

        deColl.update(findObj, newDocument);
        
        newDocument = new BasicDBObject();
        newDocument.append("\$set", new BasicDBObject().append("property.concepts", []));

        deColl.update(findObj, newDocument);
        
        newDocument = new BasicDBObject();
        newDocument.append("\$set", new BasicDBObject().append("protocolText", 
                phenXObj.get("protocolText").replace("<div style=\"display:block\" id=\"element_PROTOCOL_TEXT\">\n  ", "").replace("</div>\n", "")
                    .replace("toolkit_content/thumb", "https://www.phenxtoolkit.org/toolkit_content/thumb")
                    .replace("toolkit_content/report", "https://www.phenxtoolkit.org/toolkit_content/report")                    
                    ));        
        deColl.update(findObj, newDocument);
        
        newDocument = new BasicDBObject();
        newDocument.append("\$set", new BasicDBObject().append("protocolDescription", phenXObj.get("protocolDescription")));
        
        deColl.update(findObj, newDocument);
    } else {
        println "No record for id: " + phenXObj.get("cadsrId")
    }
    

    
//    toUpdate.append("protocolText", phenXObj.get("protocolText"));
//    toUpdate.append("protocolDescription", phenXObj.get("protocolDescription"));
}  

if (args.contains("--merge")) {
    recList = mapColl.find();
    def totalSize = recList.size();
    def count = 0;
    for (DBObject record : recList ) {
        print (count++ / totalSize*100) + " ";
        mergeRecord(record);
    }    
}
