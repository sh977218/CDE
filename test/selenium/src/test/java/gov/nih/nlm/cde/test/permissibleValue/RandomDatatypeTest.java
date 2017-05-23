package gov.nih.nlm.cde.test.permissibleValue;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class RandomDatatypeTest extends NlmCdeBaseTest {

    @Test
    public void randomDatatype() {
        mustBeLoggedInAs(ctepCurator_username, password);
        String cdeName = "CTC Adverse Event Apnea Grade";
        goToCdeByName(cdeName);
        clickElement(By.id("pvs_tab"));
        clickElement(By.xpath("//*[@id='datatypeSelect']//span[contains(@class,'select2-selection--single')]"));
        findElement(By.xpath("//*[contains(@class,'select2-dropdown')]//*[contains(@class,'elect2-search--dropdown')]//input")).sendKeys("java.lang.Date");
        clickElement(By.xpath("(//*[contains(@class,'select2-dropdown')]//*[contains(@class,'select2-results')]//ul//li)[1]"));
        newCdeVersion();

        textPresent("java.lang.Date");

        clickElement(By.id("history_tab"));
        selectHistoryAndCompare(1, 2);
        textPresent("java.lang.Date");
    }
}
