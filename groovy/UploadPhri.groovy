@Grab(group='org.mongodb', module='mongo-java-driver', version='2.11.1')
@Grab(group='org.apache.poi', module='poi-ooxml', version='3.9')

import com.mongodb.*;
import com.mongodb.util.JSON;
import java.util.UUID;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import groovy.transform.Field;
import java.util.Iterator;
import org.apache.poi.xssf.usermodel.XSSFRow;

@Field def mongoHost = System.getenv()['MONGO_HOST'];
if(mongoHost == 0) mongoHost = "localhost";

@Field def mongoDb = System.getenv()['MONGO_DB'];
if(mongoDb == null) mongoDb = "nlmcde";

@Field MongoClient mongoClient = new MongoClient( mongoHost );
@Field DB db = mongoClient.getDB(mongoDb);
@Field DBCollection deColl = db.getCollection("dataelements");
@Field DBCollection orgColl = db.getCollection("orgs");

println "PHRI Ingester"

@Field XSSFWorkbook book = new XSSFWorkbook("../nlm-seed/phri.xlsx");
@Field XSSFSheet[] sheets = book.sheets;

@Field def saveClassif = { newClassif ->
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

//@Field def buildClassif = {conceptSystem, concept ->
def BasicDBObject buildClassif (String conceptSystem, String concept) {
    def newClassif = new BasicDBObject();
    newClassif.put("conceptSystem", conceptSystem)
    newClassif.put("concept", concept)
    newClassif.put("stewardOrg", new BasicDBObject("name", "NINDS"));
    newClassif;
}

static def String getCellValue(Cell cell) {
   if(cell == null) {
       println("EMPTY CELL");
       return "";
   }
   else{
       switch (cell.getCellType()) {
           case Cell.CELL_TYPE_STRING:
               return cell.getStringCellValue().toString();
           case Cell.CELL_TYPE_NUMERIC:
               if (DateUtil.isCellDateFormatted(cell)) {
                   return cell.getDateCellValue().toString();
               } else {
                   return cell.getNumericCellValue().toBigInteger().toString();
               }
           case Cell.CELL_TYPE_BOOLEAN:
               return cell.getBooleanCellValue().toString();
           case Cell.CELL_TYPE_FORMULA:
               return cell.getCellFormula().toString();
           case Cell.CELL_TYPE_BLANK:
               return "";
           case Cell.CELL_TYPE_ERROR:
               return "";
           default:
               return "";
           }
   }
}

def xlsMap = [
    namingDesignation: 1
    , namingDefinition: 2
    , namingFhimDesignation: 8
    , defaultClassification: 0    
    , valueDomain_1: 4
    , valueDomain_2: 5
    , valueDomain_3: 6    
    , comments: 9 
    , valueDomainType: 3
];

def BasicDBObject parseValueDomain(XSSFRow row, Map xlsMap){
    def type = getCellValue(row.getCell(xlsMap.valueDomainType));
    
    BasicDBObject valueDomain = new BasicDBObject();
    
    switch (type) {
        case "Coded Value":
            valueDomain.put("datatype", "Externally Defined");    
            def vdLink = row.getCell(xlsMap.valueDomain_2).getHyperlink();    
            def vdDescription = getCellValue(row.getCell(xlsMap.valueDomain_1)) + getCellValue(row.getCell(xlsMap.valueDomain_3));    
            BasicDBObject valueDomainExternallyDefined = new BasicDBObject();
            if (vdLink!=null) {
                valueDomainExternallyDefined.put("link",vdLink.getAddress());
            }
            if (vdDescription!=null) {
                valueDomainExternallyDefined.put("description",vdDescription);
            }            
            valueDomain.put("datatypeExternallyDefined", valueDomainExternallyDefined);
        break;
        case "Date/Time":
        case "Date/Time or Timestamp (TS)":
            valueDomain.put("datatype", "Date");
        break;    
        case "String":
            valueDomain.put("datatype", "Text");
        break;          
        default:
            valueDomain.put("datatype", type);
        break;
    }
    
    valueDomain.put("permissibleValues", []); 
    valueDomain;
}

def BasicDBObject classify (BasicDBObject newDE, BasicDBObject stewardOrg, String conceptSystem, String concept) {
    /*BasicDBObject defClassification = new BasicDBObject();
    defClassification.put("conceptSystem", conceptSystem);
    defClassification.put("stewardOrg",stewardOrg);
    defClassification.put("concept", concept);*/
    def classif = buildClassif(conceptSystem, concept);
    saveClassif(classif);
    classif;      
}

def DBObject ParseRow(XSSFRow row, Map xlsMap) {
    DBObject newDE = new BasicDBObject();
    newDE.put("uuid", UUID.randomUUID() as String);
    newDE.put("created", new Date()); 
    newDE.put("origin", 'PHRI'); 
    newDE.put("originId", null);
    newDE.put("version", 1);
    
    def defaultName = new BasicDBObject();
    def namingDesignation = getCellValue(row.getCell(xlsMap.namingDesignation));
    if (namingDesignation=="")
        return null;
    defaultName.put("designation", namingDesignation);
    def namingDefinition = getCellValue(row.getCell(xlsMap.namingDefinition));
    defaultName.put("definition", namingDefinition);
    defaultName.put("languageCode", "EN-US");  
    
    BasicDBObject defContext = new BasicDBObject();
    defContext.put("contextName", 'Health');
    defContext.put("acceptability", "preferred");
    defaultName.put("context", defContext);     
                            
    def fhimName = new BasicDBObject();
    fhimName.put("designation", getCellValue(row.getCell(xlsMap.namingFhimDesignation)));  
    BasicDBObject phriContext = new BasicDBObject();
    phriContext.put("contextName", 'FHIM');
    phriContext.put("acceptability", "preferred"); 
    fhimName.put("context", phriContext);  
    
    def naming = [];
    naming.add(defaultName);
    naming.add(fhimName);
    newDE.put("naming", naming);
    
    BasicDBObject stewardOrg = new BasicDBObject();
    stewardOrg.put("name","PHRI");    
    newDE.put("stewardOrg",stewardOrg);  
    
    def phriCategory = getCellValue(row.getCell(xlsMap.defaultClassification));
    if (phriCategory=="")
        return null;    
    
    def classif = classify (newDE, stewardOrg, "S&I PHRI Category", phriCategory);
    def classificationArray = [classif];
    
                            
    BasicDBObject registrationState = new BasicDBObject();
    registrationState.put("registrationStatus", "Recorded");
    registrationState.put("registrationStatusSortOrder", 1);
    newDE.put("registrationState", registrationState);        
                            
    def valueDomain = parseValueDomain(row, xlsMap);
    
    newDE.put("valueDomain", valueDomain);  
    
    def usedByOrgs = ["PHRI"];    
    newDE.put("usedByOrgs", usedByOrgs);     
    
    def comment = getCellValue(row.getCell(xlsMap.comments));
    
    if (comment!="") {
        BasicDBObject co = new BasicDBObject();
        co.put("username","FinalDRAFT_PHRI_CoreCommon_10262012.xlsx");
        co.put("created", new Date());
        co.put("text", comment);
        def comments = [co];
        newDE.put("comments", comments);
    }
    newDE.append("classification", array);                        
    newDE;
}

def void PersistSheet(String name, Map xlsMap) {
    XSSFSheet sheet = book.getSheet(name);
    Iterator<XSSFRow> it = sheet.iterator();
    it.next();
    it.next();
    it.next();
    while (it.hasNext()) {
        XSSFRow row = it.next();
        BasicDBObject newDE = ParseRow(row, xlsMap);
        if (newDE!=null)
            deColl.insert(newDE);
    }
}

def sheetsToParse = [
    "Allergy | Adverse Event",
    "Medical Device",
    "Exposure | Injury",
    "Health Problems",
    "Physical Exam",
    "Report MetaData", 
    "Facility",
    "Encounter | Patient Visit",
    "Patient Information",
    "Immunization",
    "Medication",
    "Vital Sign Indicator",
    "Patient Contact Information",
    "Payer Information",
    "Provider Information",
    "Procedure",
    "Social History",
    "Family History",
    "Order | Diag Test", 
    "Result",
    "Specimen",
    "Employment Information"
];          

for (sheetName in sheetsToParse) {
    PersistSheet(sheetName, xlsMap);
}                    

