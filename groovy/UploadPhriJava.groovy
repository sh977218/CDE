@Grab(group='org.mongodb', module='mongo-java-driver', version='2.11.1')
@Grab(group='org.apache.poi', module='poi-ooxml', version='3.9')

import com.mongodb.*;
import com.mongodb.util.JSON;
import java.util.UUID;

//evaluate(new File("groovy/ExcelBuilder.groovy"));

def mongoHost = System.getenv()['MONGO_HOST'];
if(mongoHost == 0) mongoHost = "localhost";

def mongoDb = System.getenv()['MONGO_DB'];
if(mongoDb == null) mongoDb = "test";

MongoClient mongoClient = new MongoClient( mongoHost );
DB db = mongoClient.getDB(mongoDb);

DBCollection deColl = db.getCollection("dataelements");
DBCollection orgColl = db.getCollection("orgs");

println "PHRI Ingester"

new GroovyExcelReader().readExcel("../nlm-seed/phri.xlsx");