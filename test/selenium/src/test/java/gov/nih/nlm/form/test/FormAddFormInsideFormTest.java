package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormAddFormInsideFormTest extends BaseFormTest {
    QuestionTest questionTest = new QuestionTest();

    @Test
    public void addFormInsideFormTest() {
        String formName = "Vital Signs";
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName(formName);
        clickElement(By.id("description_tab"));
        textPresent("Show Question Search Area");
        startAddingForms();
        questionTest.addFormToSection("Traumatic Brain Injury - Adverse Events", 0);
        textPresent("Embedded Form: Traumatic Brain Injury - Adverse Events");
        saveForm();
        goToFormByName(formName);
        clickElement(By.id("nativeFormRenderLink"));
        textPresent("Embedded Form: Traumatic Brain Injury - Adverse Events");
    }

}
