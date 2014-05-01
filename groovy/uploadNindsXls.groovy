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

println "NINDS Ingester"

@Field XSSFWorkbook book = new XSSFWorkbook(args[0]);
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

// input type is free-form, single value or multi value.
def xlsMap = [
    variableName: 1
    , name: 2
    , description: 4
    , shortDescription: 5
    , datatype: 6
    , datatypeTextSize: 7
    , inputType: 8
    , minValue: 9
    , maxValue: 10
    , answerList: 11
    , answerDescriptions: 12
    , uom: 13
    , guidelines: 14
    , notes: 15
    , suggestedQuestion: 16
    , keywords: 17
    , references: 18
    , cadsrId: 21
    , nindsId: 23
    , population: 24
    , generalDomain: 25
    , tbiDomain: 26
    , parkinsonDomain: 27
    , ataxiaDomain: 28
    , strokeDomain: 29
    , alsDomain: 30
    , huntingtonDomain: 31
    , msDomain: 32
    , neuromuscDomain: 33
    , myastheniaDomain: 34
    , spinalDomain: 35
    , duchenneDomain: 36
    , congenitalDomain: 37
    , spinalCordInjuryDomain: 38
    , headacheDomain: 39
    , epilepsyDomain: 40
    , generalClassif: 41
    , acuteHospClassif: 42
    , concussionClassif: 43
    , epidemiologyClassif: 44
    , modTbiClassif: 45
    , parkinsonClassif: 46
    , friedrichClassif: 47
    , strokeClassif: 48
    , alsClassif: 49
    , huntingtonClassif: 50
    , msClassif: 51
    , neuroClassif: 52
    , myastheniaClassif: 53
    , spinalMuscAtrophClassif: 54
    , duchenneClassif: 55
    , congenitalClassif: 56
    , spinalCordInjuryClassif: 57
    , headacheClassif: 58
    , epilepsy: 59
    , previousTitle: 60
];

def DBObject ParseRow(XSSFRow row, Map xlsMap) {
    BasicDBObject newDE = new BasicDBObject();
    
    newDE.put("uuid", UUID.randomUUID() as String);
    newDE.put("created", new Date()); 
    newDE.put("origin", 'NINDS'); 
    
    def properties = [];
    def prop = new BasicDBObject();
    prop.put("key", "NINDS Variable Name");
    prop.put("value", getCellValue(row.getCell(xlsMap.variableName)));
    properties.add(prop);
    
    def namings = [];
    def naming = new BasicDBObject();
    naming.put("designation", getCellValue(row.getCell(xlsMap.name)));
    naming.put("definition", getCellValue(row.getCell(xlsMap.description)));
    namings.add(naming);
    
    if (getCellValue(row.getCell(xlsMap.description)).equals(getCellValue(row.getCell(xlsMap.shortDescription)))) {
        def shortDef = new BasicDBObject();
        naming.put("definition", getCellValue(row.getCell(xlsMap.shortDescription)));
        namings.add(naming);        
    }
    
    def vd = new BasicDBObject();
    
    def datatype = getCellValue(row.getCell(xlsMap.datatype));
    if (datatype.toLowerCase().trim().equals("numeric value")) {
        def datatypeFloat;
        if (!getCellValue(row.getCell(xlsMap.minValue)).isEmpty()) {
            datatypeFloat = new BasicDBObject();
            datatypeFloat.put(minValue, getCellValue(row.getCell(xlsMap.minValue)));
        }
        if (!getCellValue(row.getCell(xlsMap.maxValue)).isEmpty()) {
            if (datatypeFloat == null) {
                datatypeFloat = new BasicDBObject();
            }
            datatypeFloat.put(maxValue, getCellValue(row.getCell(xlsMap.maxValue)));
        }
        datatype = "Float";
        if (datatypeFloat != null) {
            vd.put("datatypeFloat", datatypeFloat);
        }
    } else if (datatype.toLowerCase().trim().equals("alphanumeric")) {
        datatype = "Text";
        if (!getCellValue(row.getCell(xlsMap.datatypeTextSize)).isEmpty()) {
            def datatypeText = new BasicDBObject();
            datatypeText.put("maxLength", getCellValue(row.getCell(xlsMap.datatypeTextSize)));
            vd.put("datatypeText", datatypeText);
        }
    } else if (datatype.toLowerCase().trim().equals("date or date & time")) {
        datatype = "Date"
    }
    
    def inputType = getCellValue(row.getCell(xlsMap.inputType));
    if (inputType.toLowerCase().trim().equals("single pre-defined value selected")) {
        def listDatatype = new BasicDBObject();
        listDatatype.put("datatype", datatype);
        datatype = "Value List";
    } else if (inputType.toLowerCase().trim().equals("multiple pre-defined values selected")) {
        def listDatatype = new BasicDBObject();
        listDatatype.put("datatype", datatype);
        listDatatype.put("multi", true);        
        datatype = "Value List";
    }

    if (datatype.equals("Value List")) {
        def answers = getCellValue(row.getCell(xlsMap.answerList)).split(";");
        def descs = getCellValue(row.getCell(xlsMap.answerDescriptions)).split(";");
        def permValues = [];
        for (int i = 0 ; i < answers.length; i++) {
            def permValue = new BasicDBObject();
            permValue.put("permissibleValue", answers[i]);
            permValue.put("valueMeaningName", descriptions[i]);
            permValues.add(permValues);
        }
        if (answers.length > 0) {
            vd.put("permissibleValues", permValues);
        }
    }
    
    def uom = getCellValue(row.getCell(xlsMap.uom));
    if (!uom.isEmpty()) {
        vd.put("uom", uom);
    }

    def guidelines = getCellValue(row.getCell(xlsMap.guidelines));
    if (!guidelines.isEmtpy()) {
        def p = new BasicDBObject();
        p.put("key", "NINDS Guidelines");
        p.put("value", getCellValue(row.getCell(xlsMap.guidelines)));
        properties.add(p);
    }
    
    def notes = getCellValue(row.getCell(xlsMap.notes));
    if (!notes.isEmtpy()) {
        def p = new BasicDBObject();
        p.put("key", "NINDS Notes");
        p.put("value", getCellValue(row.getCell(xlsMap.notes)));
        properties.add(p);
    }

    def suggestedQuestion = getCellValue(row.getCell(xlsMap.suggestedQuestion));
    if (!suggestedQuestion.isEmtpy()) {
        def p = new BasicDBObject();
        p.put("key", "NINDS Suggested Question");
        p.put("value", getCellValue(row.getCell(xlsMap.suggestedQuestion)));
        properties.add(p);
    }
    
    def keywords = getCellValue(row.getCell(xlsMap.keywords));
    if (!keyword.isEmtpy()) {
        def p = new BasicDBObject();
        p.put("key", "NINDS Keywords");
        p.put("value", getCellValue(row.getCell(xlsMap.keywords)));
        properties.add(p);
    }

    def references = getCellValue(row.getCell(xlsMap.references));
    if (!references.isEmtpy()) {
        def p = new BasicDBObject();
        p.put("key", "NINDS References");
        p.put("value", getCellValue(row.getCell(xlsMap.references)));
        properties.add(p);
    }
    
    def ids = [];
    def nindsId = new BasicDBObject();
    nindsId.put("origin", "NINDS");
    nindsId.put("id", getCellValue(row.getCell(xlsMap.nindsId)));
    ids.add(nindsId);
    
    def cadsrId = getCellValue(row.getCell(xlsMap.nindsId));
    if ()
    
    newDE;
    
    
    
}

def void PersistSheet(String name, Map xlsMap) {
    XSSFSheet sheet = book.getSheet(name);
    Iterator<XSSFRow> it = sheet.iterator();
    it.next();
    while (it.hasNext()) {
        XSSFRow row = it.next();
        BasicDBObject newDE1 = ParseRow(row, xlsMap);
        if (newDE1!=null) {
            deColl.insert(newDE1);
        }
    }
    println("Ingestion Complete");
}

def sheetsToParse = [
    "Sheet1"
];          


for (sheetName in sheetsToParse) {
    PersistSheet(sheetName, xlsMap);
}                    

