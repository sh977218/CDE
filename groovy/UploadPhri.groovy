@Grab(group='org.mongodb', module='mongo-java-driver', version='2.11.1')

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

/*new ExcelBuilder("../nlm-seed/phri.xlsx").eachLine {
    //println "First column on row ${it.rowNum} = ${cell(0)}"
    for (int i=0; i<200; i++) {
        print " ${cell(i)}\t\t\t|"
    }
    print "\n------------------------------------------------------------------------------\n"
}*/

new GroovyExcelReader().readExcel("../nlm-seed/phri.xlsx");