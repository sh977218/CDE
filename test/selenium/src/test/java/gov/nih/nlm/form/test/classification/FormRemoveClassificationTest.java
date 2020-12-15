package gov.nih.nlm.form.test.classification;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormRemoveClassificationTest extends NlmCdeBaseTest {

    @Test
    public void formRemoveClassification() {
        String formName = "PROMIS Bank v1.0 - Anxiety";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        goToGeneralDetail();
        textNotPresent("Updated:", By.id("generalDiv"));
        goToClassification();
        clickElement(By.xpath("//mat-icon[@id = 'PROMIS Instruments,Adult Item Banks,Mental Health-unclassifyBtn']"));
        clickElement(By.id("confirmDeleteClassificationBtn"));
        checkAlert("Classification removed.");
        textNotPresent("Mental Health");

        goToGeneralDetail();
        textNotPresent("Updated:", By.id("generalDiv"));
    }


}
