package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class DoNotSaveIfPendingChanges extends NlmCdeBaseTest {

    @Test
    public void doNotSaveIfPendingChanges() {
        mustBeLoggedInAs(ctepCurator_username, password);
        String cdeName = "ATRA Agent Current Report Period Administered Ind-2";
        goToCdeByName(cdeName);
        clickElement(By.id("naming_tab"));
        clickElement(By.cssSelector("#designation_0 i.fa-edit"));
        findElement(By.cssSelector("#designation_0 input")).sendKeys("[name change number 1]");
        clickElement(By.cssSelector("#designation_0 .fa-check"));
        clickElement(By.linkText("Classification"));
        Assert.assertFalse(findElement(By.id("addClassification")).isEnabled());

        clickElement(By.id("properties_tab"));
        clickElement(By.id("openNewPropertyModalBtn"));
        textPresent("Property key are managed in Org Management > List Management");
        new Select(findElement(By.id("newKey"))).selectByVisibleText("MyKey2");
        findElement(By.name("newValue")).sendKeys("MyValue2");
        hangon(2);
        clickElement(By.id("createNewPropertyBtn"));
        modalGone();

        clickElement(By.id("removeProperty-0"));
        clickElement(By.id("confirmRemoveProperty-0"));
        textPresent("Property removed. Save to confirm.");
        closeAlert();
        clickElement(By.id("ids_tab"));
        clickElement(By.id("addId"));
        findElement(By.name("source")).sendKeys("MyOrigin1");
        findElement(By.name("id")).sendKeys("MyId1");
        findElement(By.name("version")).sendKeys("MyVersion1");
        clickElement(By.id("createId"));
        textPresent("Identifier added. Save to confirm.");
        modalGone();
        closeAlert();
        clickElement(By.id("removeId-1"));
        clickElement(By.id("confirmRemoveId-1"));
        textPresent("Identifier removed. Save to confirm.");
    }


}
