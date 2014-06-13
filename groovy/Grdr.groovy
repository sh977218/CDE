@Grab(group='org.mongodb', module='mongo-java-driver', version='2.11.1')
@Grab(group='org.apache.poi', module='poi-ooxml', version='3.9')
@Grab(group='commons-lang', module='commons-lang', version='2.4')

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

println "GRDR Ingester"

@Field Classifications classifications;
classifications = new Classifications(orgColl);

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
    itemNumber: 0,
    itemConcept: 1,
    questionText: 2,
    comments: 3,
    responseCategories: 4, 
    variableStructure: 5,
    referenceCategories: 6,
    link: 7,
    requirement: 8
];

@Field def currentClassif = "";

def DBObject ParseRow(XSSFRow row, Map xlsMap) {
    BasicDBObject newDE = new BasicDBObject();
    
    newDE.put("uuid", UUID.randomUUID() as String);
    newDE.put("created", new Date()); 
    newDE.put("origin", 'GRDR'); 
    newDE.put("version", "1"); 
        
    def itemNumber = getCellValue(row.getCell(xlsMap.itemNumber)).trim();
    if (!NumberUtils.isNumber(itemNumber)) {
        currentClassif = itemNumber;
        return;
    }
    
    def itemConcept = getCellValue(row.getCell(xlsMap.itemConcept)).trim();
    itemConceptLines = itemConcept.split("\\r?\\n");
        
    
    def namings = [];
    def naming = new BasicDBObject();
    if (!itemConceptLines[0].contains("GRDR")) {
        naming.put("designation", itemConceptLines[0]);
    } else {
        naming.put("designation", itemConceptLines[1]);
    }
    naming.put("definition", getCellValue(row.getCell(xlsMap.comments)));
    naming.put("languageCode", "EN-US");  
    
    BasicDBObject defContext = new BasicDBObject();
    defContext.put("contextName", 'Health');
    defContext.put("acceptability", "preferred");
    naming.put("context", defContext);     
    
    namings.add(naming);
        
    def questionText = new BasicDBObject();
    questionText.put("designation", getCellValue(row.getCell(xlsMap.questionText)));
    questionText.put("definition", getCellValue(row.getCell(xlsMap.responseCategories)));
    questionText.put("languageCode", "EN-US");  
    BasicDBObject qContext = new BasicDBObject();
    defContext.put("contextName", 'Question');
    defContext.put("acceptability", "preferred");
    questionText.put("context", qContext);     
    
    namings.add(questionText);
    
    BasicDBObject stewardOrg = new BasicDBObject();
    stewardOrg.put("name","GRDR");    
    newDE.put("stewardOrg",stewardOrg);  
        
    BasicDBObject registrationState = new BasicDBObject();
    registrationState.put("registrationStatus", "Recorded");
    newDE.put("registrationState", registrationState);        

    def vd = new BasicDBObject();
    vd.put("definition", getCellValue(row.getCell(xlsMap.responseCategories)));
    
    def datatype = getCellValue(row.getCell(xlsMap.variableStructure));
    def pvCell = getCellValue(row.getCell(xlsMap.referenceCategories)).replaceAll("–", "-")
    if (!datatype.contains("-")) {
        if (datatype.equals("Sting") || datatype.equals("String")) {
            datatype = "Text";
        }
        vd.put("datatype", datatype);
    }
    
    def permValues = [];
    if (datatype.equalsIgnoreCase("integer") && pvCell.contains("-")) {
        vd.put("datatype", "Value List")
        def pvArray = pvCell.split("\\r?\\n");
        for (pv in pvArray) {
            def pvSplit = pv.split("-");
            if (datatype.equals("Value List")) {
                 def permValue = new BasicDBObject();
                 permValue.put("permissibleValue", pvSplit[1]);
                 permValues.add(permValue);
             }
        }        
    }
    vd.put("permissibleValues", permValues); 

    def linkCell = row.getCell(xlsMap.link);
    if (linkCell != null) {
        def link = row.getCell(xlsMap.link).getHyperlink();
        if (link != null) {
            vd.put("datatype", "Externally Defined");
            BasicDBObject ext = new BasicDBObject();
            ext.put("link", link.getAddress())
            ext.put("description", getCellValue(row.getCell(xlsMap.referenceCategories)).trim())
            vd.put("datatypeExternallyDefined", ext);
        }
    }    

    def ids = [];
    if (itemConceptLines[0].contains("GRDR")) {
        def grdrId = new BasicDBObject();
        grdrId.put("origin", "GRDR");
        grdrId.put("id", itemConceptLines[0]);
        ids.add(grdrId);    
    }
    
    newDE.put("naming", namings)
    newDE.put("valueDomain", vd);
    newDE.put("ids", ids);

    def req = getCellValue(row.getCell(xlsMap.requirement));
    if (!StringUtils.isEmpty(req)) {
        def classifToAdd = classifications.buildMultiLevelClassif("GRDR", "Requirement", req)
        classifications.addClassifToDe(classifToAdd, newDE);
        classifications.addClassifToOrg(classifToAdd);
    }
        
    if (itemConcept.contains("GUID")) {
        def classifToAdd = classifications.buildMultiLevelClassif("GRDR", "GUID", "Have GUID")
        classifications.addClassifToDe(classifToAdd, newDE);
        classifications.addClassifToOrg(classifToAdd);        
    }
    
    def classifToAdd = classifications.buildMultiLevelClassif("GRDR", "Category", currentClassif)
    classifications.addClassifToDe(classifToAdd, newDE);
    classifications.addClassifToOrg(classifToAdd);       

    newDE;
}


XSSFWorkbook book = new XSSFWorkbook(args[0]);
XSSFSheet[] sheets = book.sheets;    
XSSFSheet sheet = book.getSheet("ORDR Model Data Elements");
int max = sheet.getLastRowNum();
for (int i = 1; i < max + 1; i++) {
//    println (i + " / " + max);
    BasicDBObject newDE1 = ParseRow(sheet.getRow(i), xlsMap);
    if (newDE1!=null) {
        deColl.insert(newDE1);
    }
}

println("Ingestion Complete");

