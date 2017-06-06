package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class DeleteRootClassificationTest extends BaseClassificationTest {

    @Test
    public void deleteRootClassification() {
        String formName = "PROMIS SF v2.0 - Companionship 6a";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        clickElement(By.id("classification_tab"));
        textPresent("PROMIS / Neuro-QOL");
        clickElement(By.xpath("//*[@id='PROMIS Instruments-unclassifyBtn']"));
        clickElement(By.id("confirmDeleteClassificationBtn"));
        textNotPresent("PROMIS / Neuro-QOL");
    }
}
