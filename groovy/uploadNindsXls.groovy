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

def mongoHost = args[1];
def mongoDb = args[2];
if(mongoHost == null || mongoDb == null)  {
    println "Please specify mongodb host and dbname: 'groovy UploadCadsr.groovy [filename] [mongodb-host] [dbname]'";
    System.exit(0);
} else {
    println "MongoDB host: " + mongoHost + ", db: " + mongoDb
}

@Field MongoClient mongoClient 
mongoClient = new MongoClient( mongoHost );
@Field DB db 
db = mongoClient.getDB(mongoDb);
DBCollection deColl = db.getCollection("dataelements");
DBCollection orgColl = db.getCollection("orgs");

println "NINDS Ingester"

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
    variableName: 0
    , name: 1
    , description: 3
    , shortDescription: 4
    , datatype: 5
    , datatypeTextSize: 6
    , inputType: 7
    , minValue: 8
    , maxValue: 9
    , answerList: 10
    , answerDescriptions: 11
    , uom: 12
    , guidelines: 13
    , notes: 14
    , suggestedQuestion: 15
    , keywords: 16
    , references: 17
    , cadsrId: 20
    , nindsId: 22
    , population: 23
    , generalDomain: 24
    , tbiDomain: 25
    , parkinsonDomain: 26
    , ataxiaDomain: 27
    , strokeDomain: 28
    , alsDomain: 29
    , huntingtonDomain: 30
    , msDomain: 31
    , neuromuscDomain: 32
    , myastheniaDomain: 33
    , spinalDomain: 34
    , duchenneDomain: 35
    , congenitalDomain: 36
    , spinalCordInjuryDomain: 37
    , headacheDomain: 38
    , epilepsyDomain: 39
    , generalClassif: 40
    , acuteHospClassif: 41
    , concussionClassif: 42
    , epidemiologyClassif: 43
    , modTbiClassif: 44
    , parkinsonClassif: 45
    , friedrichClassif: 46
    , strokeClassif: 47
    , alsClassif: 48
    , huntingtonClassif: 49
    , msClassif: 50
    , neuroClassif: 51
    , myastheniaClassif: 52
    , spinalMuscAtrophClassif: 53
    , duchenneClassif: 54
    , congenitalClassif: 55
    , spinalCordInjuryClassif: 56
    , headacheClassif: 57
    , epilepsy: 58
    , previousTitle: 59
    , cdeVersion: 60
];

def void addDomain(de, type, subtype, value) { 
    if (!value.equals("") && !value.equals("N/A.N/A")) {
        for (semiColonSplit in value.split(";")) {
            def cls = new ArrayList<String>();
            cls.add(type);
            cls.add(subtype)
            cls.addAll(semiColonSplit.split("\\."));
            def classifToAdd = classifications.buildMultiLevelClassif("NINDS", cls.toArray(new String[cls.size()]));
            classifications.addClassifToDe(classifToAdd, de);
            classifications.addClassifToOrg(classifToAdd);
        }
    }
}

def void addClassification(de, type, disease, value) { 
    if (!value.equals("")) {
        def cls = new ArrayList<String>();
        cls.add(type);
        cls.add(disease)
        cls.add("Classification")
        cls.addAll(value);
        def classifToAdd = classifications.buildMultiLevelClassif("NINDS", cls.toArray(new String[cls.size()]));
        classifications.addClassifToDe(classifToAdd, de);
        classifications.addClassifToOrg(classifToAdd);
    }
}

def void addSubDiseaseClassification(de, type, disease, subDisease, value) {
    if (!value.equals("")) {
        def cls = new ArrayList<String>();
        cls.add(type);
        cls.add(disease)
        cls.add(subDisease)
        cls.add("Classification")
        cls.addAll(value);
        def classifToAdd = classifications.buildMultiLevelClassif("NINDS", cls.toArray(new String[cls.size()]));
        classifications.addClassifToDe(classifToAdd, de);
        classifications.addClassifToOrg(classifToAdd);
    }
}

def DBObject ParseRow(XSSFRow row, Map xlsMap) {
    BasicDBObject newDE = new BasicDBObject();
    
    newDE.put("uuid", UUID.randomUUID() as String);
    newDE.put("created", new Date()); 
    newDE.put("source", 'NINDS'); 
    newDE.put("version", getCellValue(row.getCell(xlsMap.cdeVersion))); 
    
    def properties = [];
    def prop = new BasicDBObject();
    prop.put("key", "NINDS Variable Name");
    prop.put("value", getCellValue(row.getCell(xlsMap.variableName)));
    properties.add(prop);
    
    def description = getCellValue(row.getCell(xlsMap.description)).trim();
    
    def namings = [];
    def naming = new BasicDBObject();
    naming.put("designation", getCellValue(row.getCell(xlsMap.name)));
    naming.put("definition", description);
    naming.put("languageCode", "EN-US");  
    
    BasicDBObject defContext = new BasicDBObject();
    defContext.put("contextName", 'Health');
    defContext.put("acceptability", "preferred");
    naming.put("context", defContext);     
    
    namings.add(naming);
    
    def shortDescription = getCellValue(row.getCell(xlsMap.shortDescription)).trim();
    if (!description.equalsIgnoreCase(shortDescription)) {
        def shortDef = new BasicDBObject();
        shortDef.put("definition", shortDescription);
        shortDef.put("languageCode", "EN-US");  
    
        BasicDBObject defContext2 = new BasicDBObject();
        defContext2.put("contextName", 'Short');
        defContext2.put("acceptability", "preferred");
        shortDef.put("context", defContext2);     
        namings.add(shortDef);        
    }
    
    BasicDBObject stewardOrg = new BasicDBObject();
    stewardOrg.put("name","NINDS");    
    newDE.put("stewardOrg",stewardOrg);  

    
    BasicDBObject registrationState = new BasicDBObject();
    registrationState.put("registrationStatus", "Qualified");
    newDE.put("registrationState", registrationState);        

    
    def vd = new BasicDBObject();
    
    def datatype = getCellValue(row.getCell(xlsMap.datatype));
    if (datatype.toLowerCase().trim().equals("numeric values")) {
        def datatypeFloat;
        if (!getCellValue(row.getCell(xlsMap.minValue)).isEmpty()) {
            datatypeFloat = new BasicDBObject();
            datatypeFloat.put("minValue", getCellValue(row.getCell(xlsMap.minValue)));
        }
        if (!getCellValue(row.getCell(xlsMap.maxValue)).isEmpty()) {
            if (datatypeFloat == null) {
                datatypeFloat = new BasicDBObject();
            }
            datatypeFloat.put("maxValue", getCellValue(row.getCell(xlsMap.maxValue)));
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
        vd.put("datatypeValueList", listDatatype);
    }

    def permValues = [];
    if (datatype.equals("Value List")) {
        def answers = getCellValue(row.getCell(xlsMap.answerList)).split(";");
        def descs = getCellValue(row.getCell(xlsMap.answerDescriptions)).split(";");
        for (int i = 0 ; i < answers.length; i++) {
            def permValue = new BasicDBObject();
            permValue.put("permissibleValue", answers[i]);
            if (i < descs.length) {
                permValue.put("valueMeaningName", descs[i]);
            } else {                
                permValue.put("valueMeaningName", answers[i]);
            }
            permValues.add(permValue);
        }
    }
    vd.put("permissibleValues", permValues);
    
    def uom = getCellValue(row.getCell(xlsMap.uom));
    if (!uom.isEmpty()) {
        vd.put("uom", uom);
    }

    vd.put("datatype", datatype);
    
    def guidelines = getCellValue(row.getCell(xlsMap.guidelines));
    if (!guidelines.equals("")) {
        def p = new BasicDBObject();
        p.put("key", "NINDS Guidelines");
        p.put("value", guidelines);
        properties.add(p);
    }
    
    def notes = getCellValue(row.getCell(xlsMap.notes));
    if (!notes.equals("")) {
        def p = new BasicDBObject();
        p.put("key", "NINDS Notes");
        p.put("value", notes);
        properties.add(p);
    }

    def suggestedQuestion = getCellValue(row.getCell(xlsMap.suggestedQuestion));
    if (!suggestedQuestion.equals("")) {
        def p = new BasicDBObject();
        p.put("key", "NINDS Suggested Question");
        p.put("value", suggestedQuestion);
        properties.add(p);
    }
    
    def keywords = getCellValue(row.getCell(xlsMap.keywords));
    if (!keywords.equals("")) {
        def p = new BasicDBObject();
        p.put("key", "NINDS Keywords");
        p.put("value", keywords);
        properties.add(p);
    }

    def references = getCellValue(row.getCell(xlsMap.references));
    if (!references.equals("")) {
        def p = new BasicDBObject();
        p.put("key", "NINDS References");
        p.put("value", references);
        properties.add(p);
    }
    
    def ids = [];
    def nindsId = new BasicDBObject();
    nindsId.put("source", "NINDS");
    nindsId.put("id", getCellValue(row.getCell(xlsMap.nindsId)));
    ids.add(nindsId);
    
    def cadsrId = getCellValue(row.getCell(xlsMap.cadsrId));
    if (!cadsrId.equals("")) {
        def id = new BasicDBObject();
        id.put("source", "caDSR");
        id.put("id", cadsrId);
        ids.add(id); 
    }
    
    newDE.put("naming", namings)
    newDE.put("valueDomain", vd);
    newDE.put("properties", properties);
    newDE.put("ids", ids);
    
    // Population Classification
    def pops = getCellValue(row.getCell(xlsMap.population)).split(";");
    for (pop in pops) {
        def classifToAdd = classifications.buildMultiLevelClassif("NINDS", "Population", pop);
        classifications.addClassifToDe(classifToAdd, newDE);
        classifications.addClassifToOrg(classifToAdd);
    }
    
    
    
    addDomain(newDE, "Disease", "General (For all diseases)", getCellValue(row.getCell(xlsMap.generalDomain)));
    addDomain(newDE, "Disease", "Traumatic Brain Injury", getCellValue(row.getCell(xlsMap.tbiDomain)));
    addDomain(newDE, "Disease", "Parkinson's Disease", getCellValue(row.getCell(xlsMap.parkinsonDomain)));
    addDomain(newDE, "Disease", "Friedreich's Ataxia", getCellValue(row.getCell(xlsMap.ataxiaDomain)));
    addDomain(newDE, "Disease", "Stroke", getCellValue(row.getCell(xlsMap.strokeDomain)));
    addDomain(newDE, "Disease", "Amyotrophic Lateral Sclerosis", getCellValue(row.getCell(xlsMap.alsDomain)));
    addDomain(newDE, "Disease", "Huntington's Disease", getCellValue(row.getCell(xlsMap.huntingtonDomain)));
    addDomain(newDE, "Disease", "Multiple Sclerosis", getCellValue(row.getCell(xlsMap.msDomain)));
    addDomain(newDE, "Disease", "Neuromuscular Disease", getCellValue(row.getCell(xlsMap.neuromuscDomain)));
    addDomain(newDE, "Disease", "Myasthenia Gravis", getCellValue(row.getCell(xlsMap.myastheniaDomain)));
    addDomain(newDE, "Disease", "Spinal Muscular Atrophy",getCellValue(row.getCell(xlsMap.spinalDomain)));
    addDomain(newDE, "Disease", "Duchenne Muscular Dystrophy/Becker Muscular Dystrophy",getCellValue(row.getCell(xlsMap.duchenneDomain)));
    addDomain(newDE, "Disease", "Congenital Muscular Dystrophy",getCellValue(row.getCell(xlsMap.congenitalDomain)));
    addDomain(newDE, "Disease", "Spinal Cord Injury",getCellValue(row.getCell(xlsMap.spinalCordInjuryDomain)));
    addDomain(newDE, "Disease", "Headache",getCellValue(row.getCell(xlsMap.headacheDomain)));
    addDomain(newDE, "Disease", "Epilepsy",getCellValue(row.getCell(xlsMap.epilepsyDomain)));

    addClassification(newDE, "Disease", "General (For all diseases)",getCellValue(row.getCell(xlsMap.generalClassif)));
    addClassification(newDE, "Disease", "Parkinson's Disease",getCellValue(row.getCell(xlsMap.parkinsonClassif)));
    addClassification(newDE, "Disease", "Friedreich's Ataxia",getCellValue(row.getCell(xlsMap.friedrichClassif)));
    addClassification(newDE, "Disease", "Stroke",getCellValue(row.getCell(xlsMap.strokeClassif)));
    addClassification(newDE, "Disease", "Amyotrophic Lateral Sclerosis",getCellValue(row.getCell(xlsMap.alsClassif)));
    addClassification(newDE, "Disease", "Huntington's Disease",getCellValue(row.getCell(xlsMap.huntingtonClassif)));
    addClassification(newDE, "Disease", "Multiple Sclerosis",getCellValue(row.getCell(xlsMap.msClassif)));
    addClassification(newDE, "Disease", "Neuromuscular Disease",getCellValue(row.getCell(xlsMap.neuroClassif)));
    addClassification(newDE, "Disease", "Myasthenia Gravis",getCellValue(row.getCell(xlsMap.myastheniaClassif)));
    addClassification(newDE, "Disease", "Spinal Muscular Atrophy",getCellValue(row.getCell(xlsMap.spinalMuscAtrophClassif)));
    addClassification(newDE, "Disease", "Duchenne Muscular Dystrophy/Becker Muscular Dystrophy",getCellValue(row.getCell(xlsMap.duchenneClassif)));
    addClassification(newDE, "Disease", "Congenital Muscular Dystrophy",getCellValue(row.getCell(xlsMap.congenitalClassif)));
    addClassification(newDE, "Disease", "Spinal Cord Injury",getCellValue(row.getCell(xlsMap.spinalCordInjuryClassif)));
    addClassification(newDE, "Disease", "Headache",getCellValue(row.getCell(xlsMap.headacheClassif)));
    addClassification(newDE, "Disease", "Epilepsy",getCellValue(row.getCell(xlsMap.epilepsy)));
    
    addSubDiseaseClassification(newDE, "Disease", "Traumatic Brain Injury", "Acute Hospitalized", getCellValue(row.getCell(xlsMap.acuteHospClassif)));
    addSubDiseaseClassification(newDE, "Disease", "Traumatic Brain Injury", "Concussion/Mild TBI", getCellValue(row.getCell(xlsMap.concussionClassif)));
    addSubDiseaseClassification(newDE, "Disease", "Traumatic Brain Injury", "Epidemiology", getCellValue(row.getCell(xlsMap.epidemiologyClassif)));
    addSubDiseaseClassification(newDE, "Disease", "Traumatic Brain Injury", "Moderate/Severe TBI: Rehabilitation", getCellValue(row.getCell(xlsMap.modTbiClassif)));
    
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
println("Ingestion Complete");

