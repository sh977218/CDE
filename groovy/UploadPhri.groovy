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

def mongoHost = System.getenv()['MONGO_HOST'];
if(mongoHost == 0) mongoHost = "localhost";

def mongoDb = System.getenv()['MONGO_DB'];
if(mongoDb == null) mongoDb = "test";

MongoClient mongoClient = new MongoClient( mongoHost );
DB db = mongoClient.getDB(mongoDb);

DBCollection deColl = db.getCollection("dataelements");
DBCollection orgColl = db.getCollection("orgs");

println "PHRI Ingester"

XSSFWorkbook book = new XSSFWorkbook("../nlm-seed/phri.xlsx");
XSSFSheet[] sheets = book.sheets;

static def String getCellValue(Cell cell) {
   if(cell == null)
   {
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

for (XSSFSheet sheet : sheets)
{
    println("\nSHEET NAME:"+sheet.getSheetName()+"\n");
    sheet.each { row ->
        Iterator cellIterator = row.cellIterator();
        while(cellIterator.hasNext())
        {
            XSSFCell cell = cellIterator.next();
            print(getCellValue(cell)+" ");
        }
        println();
    }
}
