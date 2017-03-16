package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormLinkedFormsTest extends BaseFormTest {

    @Test
    public void formLinkedForms() {
        goToFormByName("Neurological Assessment: TBI Symptoms and Signs");

        clickElement(By.id("linkedFormsBtn"));
        hangon(3);
        textPresent("There is 1 form that uses this form.");
        textPresent("Form In Form Num Questions", By.id("linkedFormsAccordionList"));
        textNotPresent("Neurological Assessment: TBI Symptoms and Signs", By.id("linkedFormsAccordionList"));
        textPresent("Quick Board (0)");
        clickElement(By.id("addToCompare_0"));
        textPresent("Quick Board (1)");
    }


}
