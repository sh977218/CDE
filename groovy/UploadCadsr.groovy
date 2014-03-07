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

def buildClassif = {conceptSystem, concept, org ->
    def newClassif = new BasicDBObject();
    newClassif.put("conceptSystem", conceptSystem)
    newClassif.put("concept", concept)
    newClassif.put("stewardOrg", new BasicDBObject("name", org));
    newClassif;
}

println ("ingesting: " + args[0]);
def deList = new XmlSlurper().parse(new File(args[0]));

for (int i  = 0; i < deList.DataElement.size(); i++) {
    def cadsrDE = deList.DataElement[i];
    def String workflowStatus = "";
    def int workflowStatusScore = 6;

    if (cadsrDE.WORKFLOWSTATUS.text().equals('DRAFT NEW')) {
        workflowStatus = 'Candidate';
        workflowStatusScore = 4;
    } else if (cadsrDE.WORKFLOWSTATUS.text().equals('DRAFT MOD')) {
        workflowStatus = 'Recorded';            
        workflowStatusScore = 3;
    } else if (cadsrDE.WORKFLOWSTATUS.text().equals('RELEASED')) {
        workflowStatus = 'Qualified';                        
        workflowStatusScore = 2;
    } else if (cadsrDE.WORKFLOWSTATUS.text().equals('APPRVD FOR TRIAL USE')) {
        workflowStatusScore = 1;
        workflowStatus = 'Standard';            
    }

    DBObject newDE = new BasicDBObject();

    newDE.put("uuid", UUID.randomUUID() as String); 
    newDE.put("created", new Date()); 
    newDE.put("origin", 'caDSR'); 
    newDE.put("originId", cadsrDE.PUBLICID.text() + "v" + cadsrDE.VERSION.text()); 

    newDE.put("version", cadsrDE.VERSION.text());
    newDE.put("valueDomain", new BasicDBObject("datatype": cadsrDE.VALUEDOMAIN[0].Datatype.text()));
    newDE.put("registrationState", new BasicDBObject("registrationStatus": workflowStatus));
    newDE.get("registrationState").put("registrationStatusSortOrder", workflowStatusScore);
    newDE.put("stewardOrg", new BasicDBObject("name", cadsrDE.CONTEXTNAME.text()));
    
    BasicDBObject defaultName = new BasicDBObject();
    defaultName.put("designation", cadsrDE.LONGNAME.text());
    defaultName.put("definition", cadsrDE.PREFERREDDEFINITION.text());
    defaultName.put("languageCode", "EN-US");
    
    BasicDBObject defContext = new BasicDBObject();
    defContext.put("contextName", 'Health');
    defContext.put("acceptability", "preferred");
    defaultName.put("context", defContext);
    
    def naming = [];
    naming.add(defaultName);
    newDE.put("naming", naming);

    if (cadsrDE.VALUEDOMAIN[0].ValueDomainType.text().equals("Enumerated")) {
        newDE.get("valueDomain").put("datatype", 'Value List');
    }
        
    if (cadsrDE.VALUEDOMAIN[0].UnitOfMeasure[0].text() != null && cadsrDE.VALUEDOMAIN[0].UnitOfMeasure[0].text().length() > 0) {
        newDE.get("valueDomain").put("uom", cadsrDE.VALUEDOMAIN[0].UnitOfMeasure[0].text());
    }

    def permissibleValues = [];
    for (int pvi = 0; pvi < cadsrDE.VALUEDOMAIN[0].PermissibleValues[0].PermissibleValues_ITEM.size(); pvi++) {
        def newPv = new BasicDBObject();
        newPv.put("permissibleValue", cadsrDE.VALUEDOMAIN[0].PermissibleValues[0].PermissibleValues_ITEM[pvi].VALIDVALUE[0].text());
        newPv.put("valueMeaningName", cadsrDE.VALUEDOMAIN[0].PermissibleValues[0].PermissibleValues_ITEM[pvi].VALUEMEANING[0].text());
        newPv.put("valueMeaningCode", cadsrDE.VALUEDOMAIN[0].PermissibleValues[0].PermissibleValues_ITEM[pvi].MEANINGCONCEPTS[0].text());
        permissibleValues.add(newPv);
    }
    
    newDE.get("valueDomain").put("permissibleValues", permissibleValues);

    def OC = new BasicDBObject();
    def ocConcepts = [];
    for (int occi = 0; occi < cadsrDE.DATAELEMENTCONCEPT[0].ObjectClass[0].ConceptDetails[0].ConceptDetails_ITEM.size(); occi++) {
        def concept = cadsrDE.DATAELEMENTCONCEPT[0].ObjectClass[0].ConceptDetails[0].ConceptDetails_ITEM[occi];
        def OCC = new BasicDBObject();
        OCC.put("name", concept.LONG_NAME.text());
        OCC.put("origin", concept.ORIGIN.text());
        OCC.put("originId", concept.PREFERRED_NAME.text());
        ocConcepts.add(OCC);
    }
    OC.put("concepts", ocConcepts);
    newDE.put("objectClass", OC);

    def PROP = new BasicDBObject();
    def propConcepts = [];
    for (int pci = 0; pci < cadsrDE.DATAELEMENTCONCEPT[0].Property[0].ConceptDetails[0].ConceptDetails_ITEM.size(); pci++) {
        def concept = cadsrDE.DATAELEMENTCONCEPT[0].Property[0].ConceptDetails[0].ConceptDetails_ITEM[pci];
        def PC = new BasicDBObject();
        PC.put("name", concept.LONG_NAME.text());
        PC.put("origin", concept.ORIGIN.text());
        PC.put("originId", concept.PREFERRED_NAME.text());
        propConcepts.add(PC);
    }
    PROP.put("concepts", propConcepts);
    newDE.put("property", PROP);
    
    def classification = [];
    for (int csi_i = 0; csi_i < cadsrDE.CLASSIFICATIONSLIST[0].CLASSIFICATIONSLIST_ITEM.size(); csi_i++) {
        def csi = cadsrDE.CLASSIFICATIONSLIST[0].CLASSIFICATIONSLIST_ITEM[csi_i];
        newClassif = buildClassif(csi.ClassificationScheme[0].PreferredName.text(), csi.ClassificationSchemeItemName.text(), csi.ClassificationScheme[0].ContextName.text());
        saveClassif(newClassif);
        classification.add(newClassif);
    }
    newDE.append("classification", classification);

    
    def usedByOrgs = [];    
    for (int ani = 0; ani < cadsrDE.ALTERNATENAMELIST[0].ALTERNATENAMELIST_ITEM.size(); ani++) {
        def an = cadsrDE.ALTERNATENAMELIST[0].ALTERNATENAMELIST_ITEM[ani];
        if (an.AlternateNameType.text().equals("USED_BY")) {
            usedByOrgs.add(an.AlternateName.text());
        }
    }
    newDE.append("usedByOrgs", usedByOrgs);

    deColl.insert(newDE);
        
}