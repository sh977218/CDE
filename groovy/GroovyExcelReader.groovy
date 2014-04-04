@Grab(group='org.apache.poi', module='poi-ooxml', version='3.9')

import org.apache.poi.ss.usermodel.Cell
import org.apache.poi.ss.usermodel.DateUtil
import org.apache.poi.xssf.usermodel.XSSFCell
import org.apache.poi.xssf.usermodel.XSSFSheet
import org.apache.poi.xssf.usermodel.XSSFWorkbook
 
/**
 * This class shall read the Excel file (.xlsx) and print the
 * content of each cell to the console.
 * @author Purushotham
 *
 */
class GroovyExcelReader {
 
    /**
     * This method shall iterate through each row in the sheets available
     * and print the content of each cell in the row.
     * @return
     */
     private readExcel(String fileName) {
        XSSFWorkbook book = new XSSFWorkbook(fileName);
        XSSFSheet[] sheets = book.sheets;
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
     }
 
    /**
     * This method shall take the cell object and convert it into
     * a string and return.
     * @param cell
     * @return String
     */
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
 
    static void main(String[] args) {
        GroovyExcelReader reader = new GroovyExcelReader();
        reader.readExcel('users.xlsx');
    }
}