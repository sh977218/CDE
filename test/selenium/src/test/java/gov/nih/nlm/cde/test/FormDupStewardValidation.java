package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormDupStewardValidation extends NlmCdeBaseTest {

    @Test
    public void formDupStewardValidation() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName("Double Classif Form");
        goToNaming();
        clickElement(By.cssSelector(".mat-chip-remove"));
        clickElement(By.id("openSave"));
        clickElement(By.id("confirmSaveBtn"));
        checkAlert("Duplicate Steward Classification");
        clickElement(By.id("deleteDraftBtn"));
        clickElement(By.id("confirmDeleteBtn"));
    }

}