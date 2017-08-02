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
        clickElement(By.id("classification_tab"));
        clickElement(By.xpath("//i[@id = 'PROMIS Instruments,Adult Item Banks,Mental Health-unclassifyBtn']"));
        clickElement(By.id("confirmDeleteClassificationBtn"));
        textPresent("Classification removed.");
        closeAlert();
        textNotPresent("Mental Health");
    }


}
