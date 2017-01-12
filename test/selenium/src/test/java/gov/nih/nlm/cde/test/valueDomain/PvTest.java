
package gov.nih.nlm.cde.test.valueDomain;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class PvTest extends NlmCdeBaseTest {

    @Test
    public void changePermissibleValue() {
        String cdeName = "Additional Pathologic Findings Chronic Proctocolitis Indicator";
        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName(cdeName);
        clickElement(By.id("pvs_tab"));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//td[@id='pv-0']/div/span/span[1]/i")));
        clickElement(By.cssSelector("#pv-0 .fa-edit"));
        findElement(By.cssSelector("#pv-0 input")).sendKeys(" added to pv");
        clickElement(By.cssSelector("#pv-0 .fa-check"));
        newCdeVersion("Changed PV");

        textPresent("added to pv");


        clickElement(By.id("history_tab"));
        selectHistoryAndCompare(1, 2);
        textPresent("Indeterminate added to pv", By.xpath("//*[@id='historyCompareLeft_Data Type Value List_0_0']"));
        textPresent("Indeterminate", By.xpath("//*[@id='historyCompareLeft_Data Type Value List_0_0']"));
    }

    @Test
    public void longPvList() {
        goToCdeByName("Common Toxicity Criteria Adverse Event Short Name Type");
        clickElement(By.id("pvs_tab"));
        textPresent("Hemoglobinuria");
        textNotPresent("Hypermagnesemia");
        clickElement(By.id("showMorePvs"));
        textPresent("Hypermagnesemia");
    }

}
