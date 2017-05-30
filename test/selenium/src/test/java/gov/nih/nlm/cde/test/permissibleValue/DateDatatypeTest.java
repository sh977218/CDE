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
        clickElement(By.id("pvs_tab"));
        changeDatatype(datatype);

        clickElement(By.xpath("//*[@id='datatypeDateFormat']//i"));
        findElement(By.xpath("//*[@id='datatypeDateFormat']//input")).sendKeys("format1");
        clickElement(By.xpath("//*[@id='datatypeDateFormat']//button[contains(@class,'fa fa-check')]"));
        newCdeVersion();

        clickElement(By.id("history_tab"));
        selectHistoryAndCompare(1, 2);
        textPresent("Date", By.xpath("//*[@id='historyCompareLeft_Date']"));
        textPresent("Value List", By.xpath("//*[@id='historyCompareRight_Value Type']"));
        textPresent("format1", By.xpath("//*[@id='historyCompareLeft_Date']"));

        clickElement(By.id("pvs_tab"));
        clickElement(By.xpath("//*[@id='datatypeDateFormat']//i"));
        findElement(By.xpath("//*[@id='datatypeDateFormat']//input")).clear();
        findElement(By.xpath("//*[@id='datatypeDateFormat']//input")).sendKeys("format2");
        clickElement(By.xpath("//*[@id='datatypeDateFormat']//button[contains(@class,'fa fa-check')]"));
        newCdeVersion();

        goToCdeByName(cdeName);
        clickElement(By.id("history_tab"));
        selectHistoryAndCompare(1, 2);
        textPresent("format2", By.xpath("//*[@id='historyCompareLeft_Data Type Date']//*[contains(@class,'format')]"));
        textPresent("format1", By.xpath("//*[@id='historyCompareRight_Data Type Date']//*[contains(@class,'format')]"));
    }
}