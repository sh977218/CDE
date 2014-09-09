@Grab(group='org.mongodb', module='mongo-java-driver', version='2.11.1')
@Grab(group='org.apache.poi', module='poi-ooxml', version='3.9')

import com.mongodb.*;
import com.mongodb.util.JSON;
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

@Field XSSFWorkbook book = new XSSFWorkbook("../nlm-seed/ExternalCDEs/phri/phri.xlsx");
@Field XSSFSheet[] sheets = book.sheets;

@Field Classifications classifications = new Classifications(orgColl);

static def String getCellValue(Cell cell) {
   if(cell == null) {
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

def idUtils = new IdUtils();

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
    , chronicDisease: [
        cancerGenetics: 11,
        cancerReporting: 12,
        nationalHospitalCareSurvey: 13,
        occupationalHealth: 14
    ]    
    , communicableDisease: [
        any: 15,
        communicableSyndromic: 16,
        HAI: 17
    ]    
    , childHealth: [
        any: 18,
        immunization: 19,
        newbornHearing: 20,
        vitalStatistics: 21
    ]  
    , adverseEvents: [
        any: 22,
        ASTER1: 23,
        AHRQCommonFormats: 24,
        ASTERD: 25,
        ICSRR2: 26
    ]     
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

def parsePatientStory(ArrayList<BasicDBObject> classificationArray, BasicDBObject stewardOrg, Map xlsMap, XSSFRow row){    
    if(getCellValue(row.getCell(xlsMap.chronicDisease.cancerGenetics))=="Yes")
        classifications.classify(classificationArray, "PHRI", "Chronic Disease", "Cancer Genetics");        
    if(getCellValue(row.getCell(xlsMap.chronicDisease.cancerReporting))=="Yes")
        classifications.classify(classificationArray, "PHRI", "Chronic Disease", "Cancer Reporting");        
    if(getCellValue(row.getCell(xlsMap.chronicDisease.nationalHospitalCareSurvey))=="Yes")
        classifications.classify(classificationArray, "PHRI", "Chronic Disease", "National Hospital Care Survey");       
    if(getCellValue(row.getCell(xlsMap.chronicDisease.occupationalHealth))=="Yes")
        classifications.classify(classificationArray, "PHRI", "Chronic Disease", "Occupational Health");    
    
    if(getCellValue(row.getCell(xlsMap.communicableDisease.any))=="Yes")
        classifications.classify(classificationArray, "PHRI", "Communicable Disease", "Any");           
    if(getCellValue(row.getCell(xlsMap.communicableDisease.communicableSyndromic))=="Yes")
        classifications.classify(classificationArray, "PHRI", "Communicable Disease", "Communicable & Syndromic");       
    if(getCellValue(row.getCell(xlsMap.communicableDisease.HAI))=="Yes")
        classifications.classify(classificationArray, "PHRI", "Communicable Disease", "HAI"); 
        
    if(getCellValue(row.getCell(xlsMap.childHealth.any))=="Yes")
        classifications.classify(classificationArray, "PHRI", "Child Health", "Any");        
    if(getCellValue(row.getCell(xlsMap.childHealth.immunization))=="Yes")
        classifications.classify(classificationArray, "PHRI", "Child Health", "Immunization");        
    if(getCellValue(row.getCell(xlsMap.childHealth.newbornHearing))=="Yes")
        classifications.classify(classificationArray, "PHRI", "Child Health", "Newborn Hearing");       
    if(getCellValue(row.getCell(xlsMap.childHealth.vitalStatistics))=="Yes")
        classifications.classify(classificationArray, "PHRI", "Child Health", "Vital Statistics");    
        
    if(getCellValue(row.getCell(xlsMap.adverseEvents.any))=="Yes")
        classifications.classify(classificationArray, "PHRI", "Adverse Events", "Any");        
    if(getCellValue(row.getCell(xlsMap.adverseEvents.ASTER1))=="Yes")
        classifications.classify(classificationArray, "PHRI", "Adverse Events", "ASTER 1");        
    if(getCellValue(row.getCell(xlsMap.adverseEvents.AHRQCommonFormats))=="Yes")
        classifications.classify(classificationArray, "PHRI", "Adverse Events", "AHRQ Common Formats");       
    if(getCellValue(row.getCell(xlsMap.adverseEvents.ASTERD))=="Yes")
        classifications.classify(classificationArray, "PHRI", "Adverse Events", "ASTER D");      
    if(getCellValue(row.getCell(xlsMap.adverseEvents.ICSRR2))=="Yes")
        classifications.classify(classificationArray, "PHRI", "Adverse Events", "ICSR R2");       
}


def DBObject ParseRow(XSSFRow row, Map xlsMap) {
    BasicDBObject newDE = new BasicDBObject();
    
    newDE.put("tinyId", idUtils.generateID());
    newDE.put("imported", new Date()); 
    newDE.put("source", 'PHRI'); 
    newDE.put("sourceId", null);
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
    
    def el = new BasicDBObject();
    el.put("name",phriCategory);    
    def element = new BasicDBObject();
    element.put("name","S&I PHRI Category");
    element.put("elements",[el]);
    def stewardClassificationsArray = [element];    
    def classif = classifications.buildClassif("S&I PHRI Category", phriCategory, "PHRI");
    classifications.saveClassif(classif);     
    
    def stewardClassification = classifications.buildStewardClassifictions(stewardClassificationsArray, "PHRI");
    parsePatientStory(stewardClassificationsArray, stewardOrg, xlsMap, row);    
    def classificationArray = [stewardClassification];        
    newDE.put("classification", classificationArray);
                            
    BasicDBObject registrationState = new BasicDBObject();
    registrationState.put("registrationStatus", "Recorded");
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
        BasicDBObject newDE1 = ParseRow(row, xlsMap);
        if (newDE1!=null)
            deColl.insert(newDE1);
    }
    println("Ingestion Complete");
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

