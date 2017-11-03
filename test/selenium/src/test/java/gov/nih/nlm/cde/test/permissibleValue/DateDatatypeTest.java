package gov.nih.nlm.cde.test.permissibleValue;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
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

        clickElement(By.xpath("//*[@id='datatypeDateFormat']//i"));
        findElement(By.xpath("//*[@id='datatypeDateFormat']//input")).sendKeys("format1");
        clickElement(By.xpath("//*[@id='datatypeDateFormat']//button[contains(@class,'fa fa-check')]"));
        newCdeVersion();

        goToHistory();
        selectHistoryAndCompare(1, 2);
        textPresent("Date", By.xpath("//*[@id='Data Type']//ins"));
        textPresent("Value List", By.xpath("//*[@id='Data Type']//del"));
        textPresent("format1", By.xpath("//*[@id='Data Type Date Format']//ins"));
        clickElement(By.id("closeHistoryCompareModal"));

        goToPermissibleValues();
        clickElement(By.xpath("//*[@id='datatypeDateFormat']//i"));
        findElement(By.xpath("//*[@id='datatypeDateFormat']//input")).clear();
        findElement(By.xpath("//*[@id='datatypeDateFormat']//input")).sendKeys("format2");
        clickElement(By.xpath("//*[@id='datatypeDateFormat']//button[contains(@class,'fa fa-check')]"));
        newCdeVersion();

        goToCdeByName(cdeName);
        goToHistory();
        selectHistoryAndCompare(1, 2);
        textPresent("format2", By.xpath("//*[@id='Data Type Date Format']//ins"));
        textPresent("format1", By.xpath("//*[@id='Data Type Date Format']//del"));
    }
}