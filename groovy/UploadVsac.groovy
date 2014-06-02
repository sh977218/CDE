@Grab(group='org.mongodb', module='mongo-java-driver', version='2.11.1')

import com.mongodb.*;
import com.mongodb.util.JSON;
import java.util.UUID;


def mongoHost = System.getenv()['MONGO_HOST'];
if(mongoHost == null) mongoHost = "localhost";

def mongoDb = System.getenv()['MONGO_DB'];
if(mongoDb == null) mongoDb = "test";

MongoClient mongoClient = new MongoClient( mongoHost );
DB db = mongoClient.getDB(mongoDb);

DBCollection deColl = db.getCollection("dataelements");
DBCollection orgColl = db.getCollection("orgs");

def saveClassif = { newClassif ->
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
    newClassif.put("stewardOrg", new BasicDBObject("name", "VSAC"));
    newClassif;
}


def deList = new XmlSlurper().parse(new File(args[0])).declareNamespace(ns0: "urn:ihe:iti:svs:2008");

for (int i = 0; i < deList.'ns0:DescribedValueSet'.size(); i++) {
   def valueSet = deList.'ns0:DescribedValueSet'[i];
    
   if (valueSet.'ns0:Type'.equals('Extensional') {

    println "Name: " + valueSet.@displayName;
    println "        Definition: " + valueSet.'ns0:Definition';

    def newDE = new BasicDBObject();
    newDE.put("uuid", UUID.randomUUID() as String); 
    newDE.put("created", new Date()); 
    newDE.put("origin", 'VSAC'); 
    newDE.put("originId", valueSet.@ID + "v" + valueSet.@version); 
    newDE.put("version", 1);
    newDE.put("valueDomain", new BasicDBObject("datatype": "Value List"));
    newDE.put("registrationState", new BasicDBObject("registrationStatus": "Qualified"));
    newDE.put("stewardOrg", new BasicDBObject("name", "VSAC"));
    
    ded vsacObj = new BasicDBObject();
    vsacObj.put("id", valueSet.@ID);
    vsacObj.put("name", valueSet.@displayName);
    vsacObj.put("version", valueSet.@version);

    newDE.put("dataElementConcept", new BasicDBObject("conceptualDomain", new BasicDBObject("vsac", vsacObj)));        

            
    def classif = buildClassif(valueSet.'ns0:Source', "default");
    saveClassif();

    def classification = [];
    classification.add(baseClassif);

    newDE.append("classification", classification);

    deColl.insert(newDE);
    println("saved");

    def permissibleValues = [];
    for (int pvi = 0; pvi < valueSet.'ns0:ConceptList'[0].'ns0:Concept'.size(); pvi++) {
        def concept = valueSet.'ns0:ConceptList'[0].'ns0:Concept'[pvi];
                def pvObj = new BasicDBObject();
        pvObj.put("permissibleValue", concept.@displayName);
        pvObj.put("valueMeaningName", concept.@displayName);
        pvObj.put("valueMeaningCode", concept.@code);
        pvObj.put("codeSystemName", concept.@codeSystemName);
        pvObj.put("codeSystemVersion", concept.@codeSystemVersion);
        permissibleValues.add(pvObj);
    }

    newDE.get("valueDomain").put("permissibleValues", permissibleValues);
            
    BasicDBObject defaultName = new BasicDBObject();
    defaultName.put("designation", valueSet.@displayName);
    defaultName.put("definition", valueSet.'ns0:Definition');
    defaultName.put("languageCode", "EN-US");
    
    BasicDBObject defContext = new BasicDBObject();
    defContext.put("contextName", 'Health');
    defContext.put("acceptability", "preferred");
    defaultName.put("context", defContext);
    
    def naming = [];
    naming.add(defaultName);
    newDE.put("naming", naming);
            
 }
}


