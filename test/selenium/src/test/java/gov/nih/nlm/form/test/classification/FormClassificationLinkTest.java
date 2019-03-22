package gov.nih.nlm.form.test.classification;


import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormClassificationLinkTest extends BaseFormTest {

    @Test
    public void formClassificationLink() {
        String formName = "Skin Cancer Patient";
        goToFormByName(formName);
        goToClassification();
        textPresent("Disease");
        textPresent("Headache");
        textPresent("Participant/Subject History and Family History");
        clickElement(By.linkText("Participant/Subject History and Family History"));
        textPresent("Skin Cancer Patient");
    }
}
