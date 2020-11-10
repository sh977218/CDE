package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormCdeTest extends NlmCdeBaseTest {

    @Test
    public void formCdeList() {
        goToFormByName("Form: Answer List Test");
        clickElement(By.id("cdeListBtn"));
        textPresent("CTC Adverse Event Apnea Grade", By.xpath("//mat-dialog-container"));
    }

}
