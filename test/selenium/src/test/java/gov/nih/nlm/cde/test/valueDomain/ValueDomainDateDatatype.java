package gov.nih.nlm.cde.test.valueDomain;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class ValueDomainDateDatatype extends NlmCdeBaseTest {

    @Test
    public void dateDatatype() {
        mustBeLoggedInAs(ninds_username, password);
        String cdeName = "Cisternal compression type";
        goToCdeByName(cdeName);
        clickElement(By.id("pvs_tab"));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("editDatatype")));
        clickElement(By.id("editDatatype"));
        new Select(findElement(By.id("valueTypeSelect"))).selectByVisibleText("Date");
        clickElement(By.id("confirmDatatype"));

        clickElement(By.xpath("//div[@id='dateFormat']//i[@title='Edit']"));
        findElement(By.xpath("//div[@id='dateFormat']//input")).sendKeys("format1");
        clickElement(By.cssSelector("#dateFormat .fa-check"));
        newCdeVersion();


        clickElement(By.id("history_tab"));
        selectHistoryAndCompare(1, 2);
        textPresent("Date", By.xpath("//*[@id='historyCompareLeft_Date']"));
        textPresent("Value List", By.xpath("//*[@id='historyCompareRight_Value Type']"));
        textPresent("format1", By.xpath("//*[@id='historyCompareLeft_Date']"));

        clickElement(By.id("pvs_tab"));
        clickElement(By.xpath("//div[@id='dateFormat']//i[@title='Edit']"));
        findElement(By.xpath("//div[@id='dateFormat']//input")).clear();
        findElement(By.xpath("//div[@id='dateFormat']//input")).sendKeys("format2");
        clickElement(By.cssSelector("#dateFormat .fa-check"));

        newCdeVersion();

        goToCdeByName(cdeName);

        clickElement(By.id("history_tab"));
        selectHistoryAndCompare(1, 2);
        textPresent("format2", By.xpath("//*[@id='historyCompareLeft_Data Type Date']//*[contains(@class,'format')]"));
        textPresent("format1", By.xpath("//*[@id='historyCompareRight_Data Type Date']//*[contains(@class,'format')]"));
    }
}