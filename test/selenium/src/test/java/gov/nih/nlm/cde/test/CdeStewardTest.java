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

        goToCdeByName(cdeName);

        // Changes Steward and cancels
        clickElement(By.id("dd_edit_steward"));
        new Select(findElement(By.id("elt.stewardOrg.name"))).selectByVisibleText("NINDS");
        clickElement(By.id("elt.stewardOrg.name.cancel"));
        textPresent("CTEP");

        // Changes Steward and save
        clickElement(By.id("dd_edit_steward"));
        new Select(findElement(By.id("elt.stewardOrg.name"))).selectByVisibleText("NINDS");
        clickElement(By.id("elt.stewardOrg.name.ok"));
        textPresent("NINDS");
        newCdeVersion();
        Assert.assertEquals("NINDS", findElement(By.id("dd_general_steward")).getText());
        showAllTabs();
        clickElement(By.id("history_tab"));
        selectHistoryAndCompare(1, 2);
        checkInHistory("Steward", "CTEP", "NINDS");
    }
}
