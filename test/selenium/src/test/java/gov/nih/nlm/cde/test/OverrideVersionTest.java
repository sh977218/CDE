package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class OverrideVersionTest extends NlmCdeBaseTest {

    @Test
    public void overrideVersion() {
        mustBeLoggedInAs(ctepCurator_username, password);
        String cdeName = "ATRA Agent Current Report Period Administered Ind-2";
        goToCdeByName(cdeName);
        clickElement(By.id("naming_tab"));
        findElement(By.cssSelector("#dd_name_0 i.fa-edit")).click();
        findElement(By.cssSelector("#dd_name_0 input")).sendKeys("[name change number 1]");
        findElement(By.cssSelector("#dd_name_0 .fa-check")).click();

        clickElement(By.id("openSave"));
        textPresent("has already been used");
        clickElement(By.id("overrideVersion"));
        clickElement(By.id("confirmNewVersion"));

        textPresent("Saved.");
        closeAlert();
        modalGone();

        goToCdeByName(cdeName);
        textPresent("[name change number 1]");
    }

}
