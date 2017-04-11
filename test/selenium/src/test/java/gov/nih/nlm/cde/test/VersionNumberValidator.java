package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.annotations.Test;

public class VersionNumberValidator extends NlmCdeBaseTest {

    @Test
    public void versionNumberValidator() {
        mustBeLoggedInAs(ninds_username, password);
        String cdeName = "Operating room total time";
        String newName = "[name change number 2]";
        String validationError = "Version number cannot";

        goToCdeByName(cdeName);
        clickElement(By.id("naming_tab"));

        editDesignationByIndex(0,newName);
        clickElement(By.id("openSave"));
        hangon(1);
        textNotPresent(validationError);
        findElement(By.name("version")).sendKeys("/23");
        textPresent(validationError);
        findElement(By.name("version")).clear();
        textNotPresent(validationError);
        findElement(By.name("version")).sendKeys("123#abc");
        textPresent(validationError);
        hangon(.5);
        findElement(By.id("cancelSaveModal")).click();
        modalGone();
        findElement(By.id("discardChanges")).click();
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("discardChanges")));
    }


}
