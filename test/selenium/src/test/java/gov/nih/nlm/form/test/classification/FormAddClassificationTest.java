package gov.nih.nlm.form.test.classification;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormAddClassificationTest extends NlmCdeBaseTest {

    @Test
    public void formAddClassification() {
        String formName = "Traumatic Brain Injury - Adverse Events";
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName(formName);
        goToGeneralDetailForm();
        textNotPresent("Updated:", By.id("generalDiv"));
        goToClassificationForm();
        addClassificationByTree("NINDS", new String[]{"Disease", "Traumatic Brain Injury"});
        goToGeneralDetailForm();
        textNotPresent("Updated:", By.id("generalDiv"));

    }
}