package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class UpdateInFormTest extends NlmCdeBaseTest {

    @Test
    public void updateInForm() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName("Illicit/non-prescription drug use indicator");
        clickElement(By.cssSelector("[itemprop='steward'] mat-icon"));
        clickElement(By.xpath("//*[@itemprop='steward']//button[contains(.,'Confirm')]"));
        newCdeVersion();

        String formName = "Form Form Update Test";
        goToFormByName(formName);
        textPresent("Some referenced items in this form have newer versions.");
        goToFormDescription();
        textPresent("Substance User", By.id("form_0-1"));
        textPresent("(Outdated)", By.id("form_0-1"));
        textPresent("Show if: \"Neoadjuvant Therapy\" = \"Yes (specify type)\"", By.id("form_0-1"));
        clickElement(By.cssSelector(".expand-form"));
        textPresent("During the last 12 months");
        textNotPresent("(Outdated)", By.id("question_0-1-0-0"));
        clickElement(By.cssSelector("#form_0-1 button.updateQuestionBtn"));
        textPresent("Substance User", By.id("mdd_section_title"));
        textPresent("was", By.id("mdd_section_title"));
        textPresent("was", By.id("mdd_d_form"));
        clickElement(By.xpath("//button[text()='OK']"));
        saveFormEdit();
        newFormVersion();

        goToFormByName(formName);
        goToFormDescription();
        textNotPresent("(Outdated)", By.id("form_0-1"));
        textNotPresent("Substance User", By.id("form_0-1"));
    }
}
