package gov.nih.nlm.cde.test.permissibleValue;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class IntegerDatatypeTest extends NlmCdeBaseTest {

    @Test
    public void integerDatatype() {
        mustBeLoggedInAs(ninds_username, password);
        String cdeName = "Alcohol Smoking and Substance Use Involvement Screening Test (ASSIST) - Tobacco product fail control indicator";
        String newDatatype = "Custom Datatype";
        goToCdeByName(cdeName);
        clickElement(By.id("pvs_tab"));
        clickElement(By.xpath("//*[@id='datatypeSelect']//span[contains(@class,'select2-selection--single')]"));
        findElement(By.xpath("//*[contains(@class,'select2-dropdown')]//*[contains(@class,'elect2-search--dropdown')]//input")).sendKeys("Custom Datatype");
        clickElement(By.xpath("(//*[contains(@class,'select2-dropdown')]//*[contains(@class,'select2-results')]//ul//li)[1]"));
        newCdeVersion();


        clickElement(By.id("history_tab"));
        selectHistoryAndCompare(1, 2);
        textPresent(newDatatype, By.xpath("//*[@id='historyCompareLeft_Value Type']"));

        clickElement(By.id("pvs_tab"));
        clickElement(By.xpath("//*[@id='datatypeSelect']//span[contains(@class,'select2-selection--single')]"));
        findElement(By.xpath("//*[contains(@class,'select2-dropdown')]//*[contains(@class,'elect2-search--dropdown')]//input")).sendKeys("Other Datatype");
        clickElement(By.xpath("(//*[contains(@class,'select2-dropdown')]//*[contains(@class,'select2-results')]//ul//li)[1]"));
        newCdeVersion();

        goToCdeByName(cdeName);

        clickElement(By.id("history_tab"));
        selectHistoryAndCompare(1, 2);
        textPresent("Other Datatype", By.xpath("//*[@id='historyCompareLeft_Value List Data Type']"));
        textPresent(newDatatype, By.xpath("//*[@id='historyCompareRight_Value List Data Type']"));
    }

}