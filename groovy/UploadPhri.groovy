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
DBCollection orgColl = db.getCollection("orgs");

println "PHRI Ingester"

@Field XSSFWorkbook book = new XSSFWorkbook("../nlm-seed/phri.xlsx");
@Field XSSFSheet[] sheets = book.sheets;

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
    , defaultClassification: 1
    
    , valueDomain_1: 4
    , valueDomain_2: 5
    , valueDomain_3: 6
    
    , comments: 9                        
];


def DBObject ParseRow(XSSFRow row, Map xlsMap) {
    DBObject newDE = new BasicDBObject();
    newDE.put("uuid", UUID.randomUUID() as String);
    newDE.put("created", new Date()); 
    newDE.put("origin", 'PHRI'); 
    newDE.put("originId", "FinalDRAFT_PHRI_CoreCommon_10262012.xlsx");
    newDE.put("version", "FinalDRAFT_PHRI_CoreCommon_10262012.xlsx");
    
    def defaultName = new BasicDBObject();
    defaultName.put("designation", getCellValue(row.getCell(xlsMap.namingDesignation)));
    defaultName.put("definition", getCellValue(row.getCell(xlsMap.namingDefinition)));
    defaultName.put("languageCode", "EN-US");  
    
    BasicDBObject defContext = new BasicDBObject();
    defContext.put("contextName", 'Health');
    defContext.put("acceptability", "preferred");
    defaultName.put("context", defContext);     
                            
    def fhimName = new BasicDBObject();
    fhimName.put("designation", getCellValue(row.getCell(xlsMap.namingFhimDesignation)));  
    fhimName.put("context", defContext);  
    
    def naming = [];
    naming.add(defaultName);
    naming.add(fhimName);
    newDE.put("naming", naming);     
    
    BasicDBObject defClassification = new BasicDBObject();
    defClassification.put("conceptSystem", "S&I PHRI Category");
    defClassification.put("concept", getCellValue(row.getCell(xlsMap.defaultClassification)));
    def classification = [defClassification];
    BasicDBObject stewardOrg = new BasicDBObject();
    stewardOrg.put("name","PHRI");
    defClassification.put("stewardOrg",stewardOrg);
    newDE.put("classification", classification);  

    newDE.put("stewardOrg",stewardOrg);
    

                            
    BasicDBObject registrationState = new BasicDBObject();
    registrationState.put("registrationStatus", "Qualified");
    registrationState.put("registrationStatusSortOrder", 1);
    newDE.put("registrationState", registrationState);    
    
                            
    BasicDBObject valueDomain = new BasicDBObject();
    valueDomain.put("datatype", "Externally Defined");
    def vdLink = getCellValue(row.getCell(xlsMap.valueDomain_2));
    //valueDomain.put("link", vdLink);
    def vdExplanation = getCellValue(row.getCell(xlsMap.valueDomain_1)) + getCellValue(row.getCell(xlsMap.valueDomain_3));
    //valueDomain.put("explanation", vdExplanation);
    
    
    BasicDBObject valueDomainExternallyDefined = new BasicDBObject();
    valueDomainExternallyDefined.put("link",vdLink);
    valueDomainExternallyDefined.put("explanation",vdExplanation);
    valueDomain.put("datatypeExternallyDefined", valueDomainExternallyDefined);
    
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
        BasicDBObject newDE = ParseRow(row, xlsMap);
        deColl.insert(newDE);
    }
}

PersistSheet("Allergy | Adverse Event", xlsMap);

