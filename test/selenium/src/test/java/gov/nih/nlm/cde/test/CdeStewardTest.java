package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeStewardTest extends NlmCdeBaseTest {

    @Test
    public void changeCDESteward() {
        mustBeLoggedInAs(classificationMgtUser_username, password);
        String cdeName = "Patient Tissue Specimen Colorectal Research Consent Ind-2";
        String oldStewardOrgName = "CTEP";
        String newStewardOrgName = "NINDS";
        goToCdeByName(cdeName);

        // Changes Steward and cancels
        clickElement(By.id("dd_edit_steward"));
        new Select(findElement(By.id("elt.stewardOrg.name"))).selectByVisibleText(newStewardOrgName);
        clickElement(By.id("elt.stewardOrg.name.cancel"));
        textPresent(oldStewardOrgName);

        // Changes Steward and save
        clickElement(By.id("dd_edit_steward"));
        new Select(findElement(By.id("elt.stewardOrg.name"))).selectByVisibleText(newStewardOrgName);
        clickElement(By.id("elt.stewardOrg.name.ok"));
        textPresent(newStewardOrgName);
        newCdeVersion();
        Assert.assertEquals(newStewardOrgName, findElement(By.id("dd_general_steward")).getText());

        clickElement(By.id("history_tab"));
        selectHistoryAndCompare(1, 2);
        textPresent(newStewardOrgName, By.xpath("//*[@id='Steward Org']//ins"));
        textPresent(oldStewardOrgName, By.xpath("//*[@id='Steward Org']//del"));
    }
}
