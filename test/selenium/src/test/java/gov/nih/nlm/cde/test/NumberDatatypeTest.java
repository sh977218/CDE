package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class NumberDatatypeTest extends NlmCdeBaseTest {
    @Test
    public void numberDatatype() {
        mustBeLoggedInAs(ninds_username, password);
        String cdeName = "Resource Utilization Group Version IV (RUG IV) - alpha-numeric code";
        goToCdeByName(cdeName);
        clickElement(By.id("pvs_tab"));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("editDatatype")));
        clickElement(By.id("editDatatype"));
        new Select(findElement(By.id("valueTypeSelect"))).selectByVisibleText("Number");
        clickElement(By.id("confirmDatatype"));

        clickElement(By.xpath("//div[@id='numberMinValue']//i[@title='Edit']"));
        clickElement(By.xpath("//div[@id='numberMaxValue']//i[@title='Edit']"));
        findElement(By.xpath("//div[@id='numberMinValue']//input")).sendKeys("123");
        findElement(By.xpath("//div[@id='numberMaxValue']//input")).sendKeys("456");
        clickElement(By.cssSelector("#numberMinValue .fa-check"));
        clickElement(By.cssSelector("#numberMaxValue .fa-check"));
        newCdeVersion();


        clickElement(By.id("history_tab"));
        selectHistoryAndCompare(1, 2);
        textPresent("123", By.xpath("//*[@id='historyCompareLeft_Number']"));
        textPresent("456", By.xpath("//*[@id='historyCompareLeft_Number']"));
        textPresent("Number", By.xpath("//*[@id='historyCompareLeft_Value Type']"));

        clickElement(By.id("pvs_tab"));
        clickElement(By.xpath("//div[@id='numberMinValue']//i[@title='Edit']"));
        clickElement(By.xpath("//div[@id='numberMaxValue']//i[@title='Edit']"));
        findElement(By.xpath("//div[@id='numberMinValue']//input")).clear();
        findElement(By.xpath("//div[@id='numberMaxValue']//input")).clear();
        findElement(By.xpath("//div[@id='numberMinValue']//input")).sendKeys("789");
        findElement(By.xpath("//div[@id='numberMaxValue']//input")).sendKeys("987");
        clickElement(By.cssSelector("#numberMinValue .fa-check"));
        clickElement(By.cssSelector("#numberMaxValue .fa-check"));
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