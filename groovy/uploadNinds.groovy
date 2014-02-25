@Grab(group='org.mongodb', module='mongo-java-driver', version='2.11.1')

import com.mongodb.*;
import com.mongodb.util.JSON;
import java.util.UUID;

MongoClient mongoClient = new MongoClient( "localhost" );
String dbName = args.contains("--testMode")?"test":"nlmcde"; 
DB db = mongoClient.getDB(dbName);

DBCollection deColl = db.getCollection("dataelements");
DBCollection orgColl = db.getCollection("orgs");

def report = new XmlSlurper().parse(new File("../nlm-seed/ExternalCDEs/ninds/all/cdes.xml"));

def classif = new Classif();

def baseClassif = classif.buildClassif("Disease", "General (For all diseases)")
classif.saveClassif(baseClassif);

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
    
    if (cde.@PvText != null) {
        def permissibleValues = [];
        newDE.get("valueDomain").put("datatype", 'Value List');
         
        String[] pvs = ((String)cde.@PvText).split(";");
        for (String pv : pvs) {
            if (pv.length() >  0) {
                permissibleValues.add(new BasicDBObject("permissibleValue", pv));
            }
        }
        newDE.get("valueDomain").put("permissibleValues", permissibleValues);
    }
    
    def classification = [];
    classification.add(baseClassif);
//            
//    if (process.argv[2] === "all") {
//        var newClassif = {conceptSystem: "Disease", concept: "General (For all diseases)", stewardOrg: {name: "NINDS"}};
//        newDE.classification.push(newClassif);                
//    }
//            

     def newClassif = classif.buildClassif("Classification", (String)cde.@textbox59);
     classif.saveClassif(newClassif);
     classification.add(newClassif);
            
    String[] population = ((String)cde.@textbox81).split(';');
    for (String pop : population) {
        newClassif = classif.buildClassif("Population", pop);
        classif.saveClassif(newClassif);
        classification.add(newClassif);
    }
            
    newClassif = classif.buildClassif("Domain", (String)cde.@textbox87);
    classif.saveClassif(newClassif);
    classification.add(newClassif);
    
    newClassif = classif.buildClassif("Sub-Domain", (String)cde.@textbox62);
    classif.saveClassif(newClassif);
    classification.add(newClassif);

    newClassif = classif.buildClassif("CRF Module / Guideline", (String)cde.@textbox63);
    classif.saveClassif(newClassif);
    classification.add(newClassif);
    
    newDE.append("classification", classification);

    deColl.insert(newDE);
    println("saved");

}
