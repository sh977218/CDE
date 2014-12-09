@Grab(group='org.mongodb', module='mongo-java-driver', version='2.11.1')

import com.mongodb.*;
import com.mongodb.util.JSON;
import org.xml.sax.InputSource;

def mongoHost = args[1];
def mongoDb = args[2];
def testMode =  args[3] == "test"; 

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

println ("ingesting: " + args[0]);

File file = new File(args[0]);
InputStream inputStream = new FileInputStream(file);
Reader reader = new InputStreamReader(inputStream,"UTF-8"); 
InputSource is = new InputSource(reader);
is.setEncoding("UTF-8");
def deList = new XmlSlurper().parse(is);

def contextIgnoreList = ['NINDS'];
def contextWhiteList = ['NIDA', 'PhenX'];

for (int i  = 0; i < deList.DataElement.size(); i++) {
    def cadsrDE = deList.DataElement[i];
    def String workflowStatus = "";
  
    if (cadsrDE.WORKFLOWSTATUS.text().equals('DRAFT NEW')) {
        workflowStatus = 'Candidate';
    } else if (cadsrDE.WORKFLOWSTATUS.text().equals('DRAFT MOD')) {
        workflowStatus = 'Recorded';            
    } else if (cadsrDE.WORKFLOWSTATUS.text().equals('RELEASED')) {
        workflowStatus = 'Qualified';                        
    } else if (cadsrDE.WORKFLOWSTATUS.text().equals('APPRVD FOR TRIAL USE')) {
        workflowStatus = 'Standard';            
    }
    
    if ("Standard".equals(cadsrDE.REGISTRATIONSTATUS.text())) {
        workflowStatus = 'Standard';
    }

    DBObject newDE = new BasicDBObject();

    newDE.put("tinyId", idUtils.generateID()); 
    newDE.put("imported", new Date()); 
    newDE.put("source", 'caDSR'); 
    newDE.put("version", cadsrDE.VERSION.text());
    
    def origin = cadsrDE.ORIGIN.text();
    if (origin != null && origin.length() > 0) {
        newDE.put("origin", origin); 
    }
    
    def vd = new BasicDBObject("datatype": cadsrDE.VALUEDOMAIN[0].Datatype.text());
    vd.put("name", cadsrDE.VALUEDOMAIN[0].LongName.text());
    newDE.put("valueDomain", vd);
    newDE.put("registrationState", new BasicDBObject("registrationStatus": workflowStatus));
    newDE.put("stewardOrg", new BasicDBObject("name", cadsrDE.CONTEXTNAME.text()));
    
    BasicDBObject defaultName = new BasicDBObject();
    defaultName.put("designation", cadsrDE.LONGNAME.text());
    defaultName.put("definition", cadsrDE.PREFERREDDEFINITION.text());
    defaultName.put("languageCode", "EN-US");
    
    BasicDBObject defContext = new BasicDBObject();
    defContext.put("contextName", 'Health');
    defContext.put("acceptability", "preferred");
    defaultName.put("context", defContext);
    
    BasicDBObject prefQContext = new BasicDBObject();
    prefQContext.put("contextName", 'Preferred Question Text');
    prefQContext.put("acceptability", "preferred");
    prefQContext.put("context", defContext);
    
    BasicDBObject altQContext = new BasicDBObject();
    altQContext.put("contextName", 'Alternate Question Text');
    altQContext.put("acceptability", "preferred");
    altQContext.put("context", defContext);
    
    def naming = [];
    naming.add(defaultName);
    
    def prefQs = [];
    def altQs = [];
    //preferred question text
    for (int rdi = 0; rdi < cadsrDE.REFERENCEDOCUMENTSLIST[0].REFERENCEDOCUMENTSLIST_ITEM.size(); rdi++) {
        if ("Preferred Question Text".equals(cadsrDE.REFERENCEDOCUMENTSLIST[0].REFERENCEDOCUMENTSLIST_ITEM[rdi].DocumentType.text())) {
            if (!prefQs.contains(cadsrDE.REFERENCEDOCUMENTSLIST[0].REFERENCEDOCUMENTSLIST_ITEM[rdi].Name.text())) {
                BasicDBObject quesText = new BasicDBObject();
                quesText.put("designation", cadsrDE.REFERENCEDOCUMENTSLIST[0].REFERENCEDOCUMENTSLIST_ITEM[rdi].Name.text());
                quesText.put("definition", cadsrDE.REFERENCEDOCUMENTSLIST[0].REFERENCEDOCUMENTSLIST_ITEM[rdi].DocumentText.text());
                quesText.put("languageCode", "EN-US"); 
                quesText.put("context", prefQContext);
                naming.add(quesText);
            }
        }
        if ("Alternate Question Text".equals(cadsrDE.REFERENCEDOCUMENTSLIST[0].REFERENCEDOCUMENTSLIST_ITEM[rdi].DocumentType.text())) {
            if (!altQs.contains(cadsrDE.REFERENCEDOCUMENTSLIST[0].REFERENCEDOCUMENTSLIST_ITEM[rdi].Name.text())) {
                BasicDBObject quesText = new BasicDBObject();
                quesText.put("designation", cadsrDE.REFERENCEDOCUMENTSLIST[0].REFERENCEDOCUMENTSLIST_ITEM[rdi].DocumentText.text());
                quesText.put("definition", cadsrDE.REFERENCEDOCUMENTSLIST[0].REFERENCEDOCUMENTSLIST_ITEM[rdi].DocumentText.text());
                quesText.put("languageCode", "EN-US"); 
                quesText.put("context", altQContext);
                naming.add(quesText);
            }
        }    
    }
    
    newDE.put("naming", naming);

    BasicDBObject cadsrID = new BasicDBObject();
    cadsrID.put("source", 'caDSR');
    cadsrID.put("id", cadsrDE.PUBLICID.text());
    cadsrID.put("version", cadsrDE.VERSION.text());
    def ids = [];
    ids.add(cadsrID);
    newDE.put("ids", ids);

    
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
        if (cadsrDE.VALUEDOMAIN[0].PermissibleValues[0].PermissibleValues_ITEM[pvi].MEANINGCONCEPTS[0] != null)
            newPv.put("valueMeaningCodeSystem", "NCI Thesaurus");
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
    
    
    def dec = new BasicDBObject();
    def decConcepts = [];
    def decC = new BasicDBObject();
    decC.put("name", cadsrDE.DATAELEMENTCONCEPT[0].LongName.text());
    decC.put("origin", "NCI caDSR");
    decC.put("originId", cadsrDE.DATAELEMENTCONCEPT[0].PublicId.text() + "v" + cadsrDE.DATAELEMENTCONCEPT[0].Version.text());
    decConcepts.add(decC);

    dec.put("concepts", decConcepts);
    newDE.put("dataElementConcept", dec);
    
    def classificationsArrayMap = [:];
    Classifications classifications = new Classifications(orgColl);
    for (int csi_i = 0; csi_i < cadsrDE.CLASSIFICATIONSLIST[0].CLASSIFICATIONSLIST_ITEM.size(); csi_i++) {
        def csi = cadsrDE.CLASSIFICATIONSLIST[0].CLASSIFICATIONSLIST_ITEM[csi_i];
        def ctx = csi.ClassificationScheme[0].ContextName.text();

        // if caBIG > PhenX, replace with PhenX
        if (ctx.equals("caBIG") && "PhenX".equals(csi.ClassificationScheme[0].PreferredName.text().trim())) {
            ctx = 'PhenX';
        }
        if (csi.ClassificationScheme[0].PreferredName.text()!=""
            && csi.ClassificationScheme[0].PreferredName.text()!=null
            && csi.ClassificationSchemeItemName.text()!=""
            && csi.ClassificationSchemeItemName.text()!=null) {
                // only load allowed classifications
//                if (contextWhiteList.contains(ctx) || (testMode && !contextIgnoreList.contains(ctx))) {
                if (testMode && !contextIgnoreList.contains(ctx)) {
                    def list = classificationsArrayMap.get(ctx);
                    if (!list) { 
                        list = [];
                        classificationsArrayMap.put(ctx,list);
                    }                
                    classifications.classify(list, ctx, csi.ClassificationScheme[0].PreferredName.text(), csi.ClassificationSchemeItemName.text());       
                }
        }
    }
    
    for (steward in classificationsArrayMap) {
        def list = steward.value;
        def stewardClassification = classifications.buildStewardClassifictions(list, steward.key);
        def classifs = newDE.get("classification");
        if (!classifs) classifs=[];
        classifs.add(stewardClassification);   
        newDE.append("classification",classifs);
    }


    
    def usedByOrgs = [];    
    for (int ani = 0; ani < cadsrDE.ALTERNATENAMELIST[0].ALTERNATENAMELIST_ITEM.size(); ani++) {
        def an = cadsrDE.ALTERNATENAMELIST[0].ALTERNATENAMELIST_ITEM[ani];
        if (an.AlternateNameType.text().equals("USED_BY")) {
            usedByOrgs.add(an.AlternateName.text());
        }
    }
    newDE.append("usedByOrgs", usedByOrgs);
    
    
    if (testMode) {
        deColl.insert(newDE);
    } else {
        if (!cadsrDE.LONGNAME.text().contains("java.lang")) {
            // If not classified, don't load
            // if Standard, load anyway
//            if ((newDE.get("classification") != null && newDE.get("classification").size() > 0) || "Standard".equals(cadsrDE.REGISTRATIONSTATUS.text())) {
                deColl.insert(newDE);
//            }
        }
    }
}