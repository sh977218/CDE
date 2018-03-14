package gov.nih.nlm.cde.test.permissibleValue;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class DateDatatypeTest extends NlmCdeBaseTest {

    @Test
    public void dateDatatype() {
        String cdeName = "Cisternal compression type";
        String datatype = "Date";

        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        goToPermissibleValues();
        changeDatatype(datatype);

        new Select(findElement(By.id("datatypeDatePrecision"))).selectByVisibleText("Month");
        newCdeVersion();

        goToHistory();
        selectHistoryAndCompare(1, 2);
        textPresent("Date", By.xpath("//*[@id='Data Type']//ins"));
        textPresent("Value List", By.xpath("//*[@id='Data Type']//del"));
        textPresent("format1", By.xpath("//*[@id='Data Type Date Format']//ins"));
        clickElement(By.id("closeHistoryCompareModal"));

        goToPermissibleValues();
        new Select(findElement(By.id("datatypeDatePrecision"))).selectByVisibleText("Year");
        newCdeVersion();

        goToCdeByName(cdeName);
        goToHistory();
        selectHistoryAndCompare(1, 2);
        textPresent("Year", By.xpath("//*[@id='Data Type Date Precision']//ins"));
        textPresent("Month", By.xpath("//*[@id='Data Type Date Precision]//del"));
    }
}