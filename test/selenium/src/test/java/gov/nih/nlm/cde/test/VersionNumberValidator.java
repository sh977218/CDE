package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.annotations.Test;

public class VersionNumberValidator extends NlmCdeBaseTest {

    @Test
    public void versionNumberValidator() {
        String cdeName = "Operating room total time";
        String newName = "[name change number 2]";
        String validationError = "Version number cannot include characters other than letters, numbers";

        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        goToNaming();
        editDesignationByIndex(0, newName,null);
        clickElement(By.id("openSave"));
        textNotPresent(validationError);
        findElement(By.id("newVersion")).sendKeys("/23");
        textPresent(validationError);
        findElement(By.id("newVersion")).sendKeys(Keys.BACK_SPACE, Keys.BACK_SPACE, Keys.BACK_SPACE, Keys.BACK_SPACE);
        textNotPresent(validationError);
        hangon(1);
        findElement(By.id("newVersion")).sendKeys("123#abc");
        wait.until(ExpectedConditions.textToBePresentInElementValue(By.id("newVersion"), "123#abc"));
        textPresent(validationError);
        clickElement(By.id("cancelSaveBtn"));
        modalGone();
    }

}
