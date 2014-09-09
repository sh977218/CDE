@Grab(group='org.mongodb', module='mongo-java-driver', version='2.11.1')
@Grab(group='org.apache.poi', module='poi-ooxml', version='3.9')
@Grab(group='commons-lang', module='commons-lang', version='2.4')

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
import org.apache.commons.lang.NumberUtils;
import org.apache.commons.lang.StringUtils;


@Field def mongoHost = System.getenv()['MONGO_HOST'];
if(mongoHost == null) mongoHost = "localhost";

@Field def mongoDb = System.getenv()['MONGO_DB'];
if(mongoDb == null) mongoDb = "nlmcde";

@Field MongoClient mongoClient 
mongoClient = new MongoClient( mongoHost );
@Field DB db 
db = mongoClient.getDB(mongoDb);
DBCollection deColl = db.getCollection("dataelements");
DBCollection orgColl = db.getCollection("orgs");

println "Eye Gene Ingester"

@Field Classifications classifications;
classifications = new Classifications(orgColl);

def idUtils = new IdUtils();

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

// input type is free-form, single value or multi value.
@Field def xlsMap = [
    findingId: 0,
    name: 1,
    diagnoses: 2,
    answers: 3,
];

@Field def currentClassif = "";

def DBObject ParseRow(XSSFRow row, Map xlsMap) {
    BasicDBObject newDE = new BasicDBObject();
    
    newDE.put("tinyId", idUtils.generateID());
    newDE.put("imported", new Date()); 
    newDE.put("source", 'EyeGene'); 
    newDE.put("version", "1"); 
        
    def namings = [];
    def naming = new BasicDBObject();
    naming.put("designation", getCellValue(row.getCell(xlsMap.name)));
    naming.put("definition", getCellValue(row.getCell(xlsMap.answers)));
    naming.put("languageCode", "EN-US");  
    
    BasicDBObject defContext = new BasicDBObject();
    defContext.put("contextName", 'Health');
    defContext.put("acceptability", "preferred");
    naming.put("context", defContext);     
    
    namings.add(naming);
            
    BasicDBObject stewardOrg = new BasicDBObject();
    stewardOrg.put("name","EyeGene");    
    newDE.put("stewardOrg",stewardOrg);  
        
    BasicDBObject registrationState = new BasicDBObject();
    registrationState.put("registrationStatus", "Recorded");
    newDE.put("registrationState", registrationState);        

    def vd = new BasicDBObject();

    
    def permValues = [];

    def pvCell = getCellValue(row.getCell(xlsMap.answers));
    if (pvCell.contains("*") || pvCell.contains("#")) {
        vd.put("datatype", "Value List");
        if (pvCell.contains("#")) {
            def listDatatype = new BasicDBObject();
            listDatatype.put("multi", true);
            vd.put("datatypeValueList", listDatatype);
            for (String p : pvCell.trim().split("#")) {
                if (p.length() > 0) {
                    def permValue = new BasicDBObject();
                    permValue.put("permissibleValue", p.trim());
                    permValues.add(permValue);
                }
            }
        }
        if (pvCell.contains("*")) {
            for (String p : pvCell.trim().split("\\*")) {
                if (p.length() > 0) {
                    def permValue = new BasicDBObject();
                    permValue.put("permissibleValue", p.trim());
                    permValues.add(permValue);
                }
            }
        }
    } else {
        vd.put("datatype", "Text");
    }    
    
    vd.put("permissibleValues", permValues);

    
    def ids = [];
    def eyeId = new BasicDBObject();
    eyeId.put("source", "EyeGene");
    eyeId.put("id", getCellValue(row.getCell(xlsMap.findingId)));
    ids.add(eyeId);    
    
    newDE.put("naming", namings)
    newDE.put("valueDomain", vd);
    newDE.put("ids", ids);

    def diagnoses = getCellValue(row.getCell(xlsMap.diagnoses));
    for (String diag : diagnoses.split(",")) {
        def classifToAdd = classifications.buildMultiLevelClassif("EyeGene", "Diagnoses", diag.trim());
        classifications.addClassifToDe(classifToAdd, newDE);
        classifications.addClassifToOrg(classifToAdd);
    }
    
    newDE;
}


XSSFWorkbook book = new XSSFWorkbook(args[0]);
XSSFSheet[] sheets = book.sheets;    
XSSFSheet sheet = book.getSheet("Sheet1");
int max = sheet.getLastRowNum();
for (int i = 1; i < max + 1; i++) {
//    println (i + " / " + max);
    BasicDBObject newDE1 = ParseRow(sheet.getRow(i), xlsMap);
    if (newDE1!=null) {
        deColl.insert(newDE1);
    }
}

println("Eye Ingestion Complete");

