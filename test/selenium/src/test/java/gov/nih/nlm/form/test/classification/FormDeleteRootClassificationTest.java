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
        goToGeneralDetail();
        textNotPresent("Updated:", By.xpath(xpathGeneralDetailsProperty()));

        goToClassification();
        textPresent("PROMIS / Neuro-QOL");
        clickElement(By.xpath("//*[@id='PROMIS Instruments-unclassifyBtn']"));
        clickElement(By.id("confirmDeleteClassificationBtn"));
        closeAlert();
        textNotPresent("PROMIS / Neuro-QOL", By.id("preview-div"));

        goToGeneralDetail();
        textNotPresent("Updated:", By.xpath(xpathGeneralDetailsProperty()));
    }
}
