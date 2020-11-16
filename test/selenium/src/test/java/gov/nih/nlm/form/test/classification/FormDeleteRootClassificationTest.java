package gov.nih.nlm.form.test.classification;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormDeleteRootClassificationTest extends NlmCdeBaseTest {

    @Test
    public void formDeleteRootClassification() {
        String formName = "PROMIS SF v2.0 - Companionship 6a";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        goToGeneralDetailForm();
        textNotPresent("Updated:", By.id("generalDiv"));

        goToClassificationForm();
        textPresent("PROMIS / Neuro-QOL");
        clickElement(By.xpath("//*[@id='PROMIS Instruments-unclassifyBtn']"));
        clickElement(By.id("confirmDeleteClassificationBtn"));
        closeAlert();
        textNotPresent("PROMIS / Neuro-QOL");

        goToGeneralDetailForm();
        textNotPresent("Updated:", By.id("generalDiv"));
    }
}
