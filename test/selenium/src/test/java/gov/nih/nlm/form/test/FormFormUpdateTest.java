package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormFormUpdateTest extends NlmCdeBaseTest {

    @Test
    public void updateInForm() {
        mustBeLoggedInAs(testAdmin_username, password);
        String formName = "Form Form Update Test";
        goToFormByName(formName);
        textPresent("Some referenced items in this form have newer versions.");

        goToFormDescription();
        textPresent("Substance User", By.id("form_0-1"));
        textPresent("(Outdated)", By.id("form_0-1"));
        textPresent("Repeats: 5 times", By.id("form_0-1"));
        textPresent("Show if: \"Neoadjuvant Therapy\" = \"Yes (specify type)\"", By.id("form_0-1"));
        clickElement(By.xpath("//*[@id='form_0-1']//button[contains(@class,'updateQuestionBtn')]"));
        textPresent("Substance User", By.id("mdd_section_title"));
        textPresent("was", By.id("mdd_section_title"));
        textPresent("was", By.id("mdd_d_form"));
        clickElement(By.id("okSelect"));
        newFormVersion();

        goToFormByName(formName);
        goToFormDescription();
        textNotPresent("(Outdated)", By.id("form_0-1"));
        textNotPresent("Substance User", By.id("form_0-1"));
    }
}
