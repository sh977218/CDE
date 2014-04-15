@Grab(group='org.mongodb', module='mongo-java-driver', version='2.11.1')

import com.mongodb.*;
import com.mongodb.util.JSON;
import java.util.UUID;


def mongoHost = System.getenv()['MONGO_HOST'];
if(mongoHost == 0) mongoHost = "localhost";

def mongoDb = System.getenv()['MONGO_DB'];
if(mongoDb == null) mongoDb = "test";

MongoClient mongoClient = new MongoClient( mongoHost );
DB db = mongoClient.getDB(mongoDb);

DBCollection deColl = db.getCollection("dataelements");
DBCollection orgColl = db.getCollection("orgs");

def report = new XmlSlurper().parse(new File("../nlm-seed/ExternalCDEs/ninds/all/cdes.xml"));

/*def saveClassif = { newClassif ->
    def foundOrg = orgColl.findOne(new BasicDBObject("name", newClassif.get("stewardOrg").get("name")));
    
    def found = false;
    if (foundOrg == null) {
        println("Missing Org: " + newClassif.get("stewardOrg").get("name"));
    }
    def classifications = foundOrg.get("classifications");
    if (classifications == null) {
        foundOrg.put("classifications", []);
    }
    for (BasicDBObject existingClassif : classifications) {
        if ((existingClassif.get("conceptSystem").equals(newClassif.get("conceptSystem")) && (existingClassif.get("concept").equals(newClassif.get("concept"))))) {
            found = true;
        }
    }
    if (!found) {
        foundOrg.classifications.add(newClassif);
        orgColl.update(new BasicDBObject("_id", foundOrg.get("_id")), foundOrg);
    }
};

def buildClassif = {conceptSystem, concept ->
    def newClassif = new BasicDBObject();
    newClassif.put("conceptSystem", conceptSystem)
    newClassif.put("concept", concept)
    newClassif.put("stewardOrg", new BasicDBObject("name", "NINDS"));
    newClassif;
}*/

Classifications classifications = new Classifications(orgColl);

for (int i = 0 ; i < report.table1[0].table1_Group1_Collection[0].table1_Group1.size(); i++) {
    def cde = report.table1[0].table1_Group1_Collection[0].table1_Group1[i];
    
    DBObject newDE = new BasicDBObject();

    newDE.put("uuid", UUID.randomUUID() as String); 
    newDE.put("created", new Date()); 
    newDE.put("origin", 'NINDS'); 
    newDE.put("originId", (String)cde.@textbox12); 
    newDE.put("version", (String)cde.@VersionNumber);
    newDE.put("valueDomain", new BasicDBObject("datatype": (String)cde.@textbox26));
    newDE.put("registrationState", new BasicDBObject("registrationStatus": "Qualified"));
    newDE.get("registrationState").put("registrationStatusSortOrder", 2);
    newDE.put("stewardOrg", new BasicDBObject("name", "NINDS"));
    
    BasicDBObject defaultName = new BasicDBObject();
    defaultName.put("designation", (String)cde.@VariableName);
    defaultName.put("definition", (String)cde.@Definition);
    defaultName.put("languageCode", "EN-US");

    BasicDBObject defContext = new BasicDBObject();
    defContext.put("contextName", 'Health');
    defContext.put("acceptability", "preferred");
    defaultName.put("context", defContext);
    
    def naming = [];
    naming.add(defaultName);
    newDE.put("naming", naming);
    
    def pvText = cde.@PvText as String;
    def permissibleValues = [];
    if (pvText != null && pvText.length() > 0) {
        newDE.get("valueDomain").put("datatype", 'Value List');
         
        String[] pvs = pvText.split(";");
        for (String pv : pvs) {
            if (pv.length() >  0) {
                permissibleValues.add(new BasicDBObject("permissibleValue", pv));
            }
        }
    }
    newDE.get("valueDomain").put("permissibleValues", permissibleValues);
    def stewardClassificationsArray = []; 
    classifications.classify(stewardClassificationsArray, "NINDS", "Disease", "General (For all diseases)");    
    classifications.classify(stewardClassificationsArray, "NINDS", "Classification", (String)cde.@textbox59);            
    String[] population = ((String)cde.@textbox81).split(';');
    for (String pop : population) {
        classifications.classify(stewardClassificationsArray, "NINDS", "Population", pop);
    }            
    classifications.classify(stewardClassificationsArray, "NINDS", "Domain", (String)cde.@textbox87);
    classifications.classify(stewardClassificationsArray, "NINDS", "Sub-Domain", (String)cde.@textbox62);
    classifications.classify(stewardClassificationsArray, "NINDS", "CRF Module / Guideline", (String)cde.@textbox63);    
    if (stewardClassificationsArray.size()>0) {
        def stewardClassification = classifications.buildStewardClassifictions(stewardClassificationsArray, "NINDS");
        newDE.append("classification", [stewardClassification]);
    }
    deColl.insert(newDE);
    println("saved");
}
