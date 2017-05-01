package gov.nih.nlm.form.test.classification;

import gov.nih.nlm.cde.test.classification.ClassificationTest;
import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormAddClassificationTest extends BaseFormTest {

    @Test
    public void formAddClassification() {
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName("Traumatic Brain Injury - Adverse Events");
        clickElement(By.id("classification_tab"));
        new ClassificationTest()._addClassificationMethod(new String[]{"NINDS", "Disease", "Traumatic Brain Injury"});
    }
}