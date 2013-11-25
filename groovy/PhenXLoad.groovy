@Grab('net.sourceforge.htmlunit:htmlunit:2.7')
@Grab(group='org.mongodb', module='mongo-java-driver', version='2.11.1')

import com.gargoylesoftware.htmlunit.WebClient
import com.gargoylesoftware.htmlunit.html.HtmlDivision
import com.mongodb.*;
import java.text.SimpleDateFormat

MongoClient mongoClient = new MongoClient( "localhost" );
String dbName = args.contains("--testMode")?"test":"nlmcde"; 
DB db = mongoClient.getDB(dbName);

DBCollection mapColl = db.getCollection("phenXMap");

def webClient = new WebClient();


if (args.contains("--protIds")) {
    def startUrl = "file:///Users/ludetc/Downloads/phenxtoolkit_report_112113.html";
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
    def url = 'https://www.phenxtoolkit.org/index.php?pageLink=browse.protocoldetails&id=' + phenXObj.get("protocolId");
    println("querying: " + url)
    def page = webClient.getPage(url);

    final HtmlDivision div = page.getHtmlElementById("element_STANDARDS");

    def cdeTitle = div.getByXPath("p/table/tbody/tr[2]/td[1]")[0];
    def loincTitle = div.getByXPath("p/table/tbody/tr[3]/td[1]")[0];

    if (!cdeTitle.getTextContent().equals("Common Data Elements (CDE)")) {
        println "unexpected format. No CDE title for : " + url;
    } else if (!loincTitle.getTextContent().equals("Logical Observation Identifiers Names and Codes (LOINC)")) {
        println "unexpected format. No Loinc title for : " + url;
        println "actual content: " + loincTitle;
    } else {
        phenXObj.append("cadsrId", div.getByXPath("p/table/tbody/tr[2]/td[3]")[0].getTextContent());
        phenXObj.append("loincName", div.getByXPath("p/table/tbody/tr[3]/td[2]")[0].getTextContent());
        phenXObj.append("loincId", div.getByXPath("p/table/tbody/tr[3]/td[3]")[0].getTextContent());

        phenXObj.append("protocolDescription", page.getByXPath("//div[@id='element_DESCRIPTION']/p")[0].getTextContent());
        phenXObj.append("protocolDescription", page.getByXPath("//div[@id='element_PROTOCOL_TEXT']")[0].asXml())


        mapColl.update(phenXObj);
    }
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
