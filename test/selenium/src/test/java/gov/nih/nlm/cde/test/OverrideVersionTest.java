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
        findElement(By.cssSelector("#nameEdit i.fa-edit")).click();
        findElement(By.xpath("//div[@id='nameEdit']//input")).sendKeys("[name change number 1]");
        findElement(By.cssSelector(".fa-check")).click();

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
