package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeChangeStewardTest extends NlmCdeBaseTest {

    @Test
    public void cdeChangeSteward() {
        String cdeName = "Patient Tissue Specimen Colorectal Research Consent Ind-2";
        String oldStewardOrgName = "CTEP";
        String newStewardOrgName = "NINDS";

        mustBeLoggedInAs(classificationMgtUser_username, password);
        goToCdeByName(cdeName);

        // Changes Steward and cancels
        editStewardOrgAndCancel(newStewardOrgName);

        editStewardOrgAndSave(newStewardOrgName);
        newCdeVersion();
        Assert.assertEquals(newStewardOrgName, findElement(By.id("dd_general_steward")).getText());

        clickElement(By.id("history_tab"));
        selectHistoryAndCompare(1, 2);
        textPresent(newStewardOrgName, By.xpath("//*[@id='Steward Org']//ins"));
        textPresent(oldStewardOrgName, By.xpath("//*[@id='Steward Org']//del"));
    }
}
