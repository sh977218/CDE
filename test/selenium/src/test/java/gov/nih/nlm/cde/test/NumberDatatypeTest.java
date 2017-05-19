package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class NumberDatatypeTest extends NlmCdeBaseTest {
    @Test
    public void numberDatatype() {
        mustBeLoggedInAs(ninds_username, password);
        String cdeName = "Resource Utilization Group Version IV (RUG IV) - alpha-numeric code";
        goToCdeByName(cdeName);
        clickElement(By.id("pvs_tab"));
        clickElement(By.xpath("//*[@id='datatypeSelect']//i"));
        new Select(findElement(By.xpath("//*[@id='datatypeSelect']//select"))).selectByVisibleText("Number");
        clickElement(By.xpath("//*[@id='datatypeSelect']//button[contains(@class,'fa fa-check')]"));

        clickElement(By.xpath("//*[@id='datatypeNumberMin']//i[contains(@class,'fa fa-edit')]"));
        findElement(By.xpath("//*[@id='datatypeNumberMin']//input")).sendKeys("123");
        clickElement(By.xpath("//*[@id='datatypeNumberMin']//button[contains(@class,'fa fa-check')]"));

        clickElement(By.xpath("//*[@id='datatypeNumberMax']//i[contains(@class,'fa fa-edit')]"));
        findElement(By.xpath("//*[@id='datatypeNumberMax']//input")).sendKeys("456");
        clickElement(By.xpath("//*[@id='datatypeNumberMax']//button[contains(@class,'fa fa-check')]"));
        newCdeVersion();

        clickElement(By.id("history_tab"));
        selectHistoryAndCompare(1, 2);
        textPresent("123", By.xpath("//*[@id='historyCompareLeft_Number']"));
        textPresent("456", By.xpath("//*[@id='historyCompareLeft_Number']"));
        textPresent("Number", By.xpath("//*[@id='historyCompareLeft_Value Type']"));

        clickElement(By.id("pvs_tab"));
        clickElement(By.xpath("//*[@id='datatypeNumberMin']//i[contains(@class,'fa fa-edit')]"));
        findElement(By.xpath("//*[@id='datatypeNumberMin']//input")).sendKeys("789");
        clickElement(By.xpath("//*[@id='datatypeNumberMin']//button[contains(@class,'fa fa-check')]"));

        clickElement(By.xpath("//*[@id='datatypeNumberMax']//i[contains(@class,'fa fa-edit')]"));
        findElement(By.xpath("//*[@id='datatypeNumberMax']//input")).sendKeys("987");
        clickElement(By.xpath("//*[@id='datatypeNumberMax']//button[contains(@class,'fa fa-check')]"));

        newCdeVersion();

        goToCdeByName(cdeName);

        clickElement(By.id("history_tab"));
        selectHistoryAndCompare(1, 2);
        textPresent("789", By.xpath("//*[@id='historyCompareLeft_Data Type Number']//*[contains(@class,'minValue')]"));
        textPresent("987", By.xpath("//*[@id='historyCompareLeft_Data Type Number']//*[contains(@class,'maxValue')]"));
        textPresent("123", By.xpath("//*[@id='historyCompareRight_Data Type Number']//*[contains(@class,'minValue')]"));
        textPresent("456", By.xpath("//*[@id='historyCompareRight_Data Type Number']//*[contains(@class,'maxValue')]"));
    }

}