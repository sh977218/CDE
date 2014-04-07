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

/*@Field */def mongoHost = System.getenv()['MONGO_HOST'];
if(mongoHost == 0) mongoHost = "localhost";

/*@Field */def mongoDb /*= System.getenv()['MONGO_DB'];
if(mongoDb == null) mongoDb*/ = "phri";

/*@Field */MongoClient mongoClient = new MongoClient( mongoHost );
/*@Field */DB db = mongoClient.getDB(mongoDb);
/*@Field */DBCollection deColl = db.getCollection("dataelements");
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
];


def DBObject ParseRow(XSSFRow row, Map xlsMap) {
    
        def mongoHost = System.getenv()['MONGO_HOST'];
        if(mongoHost == 0) mongoHost = "localhost";
        def mongoDb = "phri";    
        MongoClient mongoClient = new MongoClient( mongoHost );
        DB db = mongoClient.getDB(mongoDb);
        DBCollection deColl = db.getCollection("dataelements");    
    
    DBObject newDE = new BasicDBObject();
    newDE.put("id",1);
    /*newDE.put("uuid", UUID.randomUUID() as String);
    newDE.put("created", new Date()); 
    newDE.put("origin", 'PHRI'); 
    newDE.put("originId", "FinalDRAFT_PHRI_CoreCommon_10262012.xlsx");
    newDE.put("version", "FinalDRAFT_PHRI_CoreCommon_10262012.xlsx");
    
    def defaultName = new BasicDBObject();
    defaultName.put("designation", getCellValue(row.getCell(xlsMap.namingDesignation)));
    defaultName.put("definition", getCellValue(row.getCell(xlsMap.namingDefinition)));
    defaultName.put("languageCode", "EN-US");  
    def naming = [];
    naming.add(defaultName);
    newDE.put("naming", naming);*/    

    deColl.insert((BasicDBObject)newDE);
}

def void PersistSheet(String name, Map xlsMap) {
    XSSFSheet sheet = book.getSheet(name);
    Iterator<XSSFRow> it = sheet.iterator();
    it.next();
    while (it.hasNext()) {
        XSSFRow row = it.next();
        ParseRow(row, xlsMap);
    }
}

PersistSheet("Allergy | Adverse Event", xlsMap);

