package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormLinkedFormsTest extends BaseFormTest {

    @Test
    public void formLinkedForms() {
        String formName = "Neurological Assessment: TBI Symptoms and Signs";
        textPresent("QUICK BOARD (0)");
        goToFormByName(formName);
        goToGeneralDetail();
        clickElement(By.id("openLinkedFormsModalBtn"));
        textPresent("There is 1 form that uses this form");
        textPresent("Form In Form Num Questions", By.id("linkedFormsAccordionList"));
        textNotPresent("Neurological Assessment: TBI Symptoms and Signs", By.id("linkedFormsAccordionList"));
        clickElement(By.id("addToCompare_0"));
        clickElement(By.id("closeLinkedFormsModalBtn"));
        textPresent("QUICK BOARD (1)");
    }


}
