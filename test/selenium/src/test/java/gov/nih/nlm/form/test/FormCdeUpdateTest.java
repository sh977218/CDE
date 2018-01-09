package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormCdeUpdateTest extends NlmCdeBaseTest {

    @Test
    public void answerList() {
        mustBeLoggedInAs(testAdmin_username, password);
        String formName = "Form Cde Update Test";
        goToFormByName(formName);
        textPresent("Some CDEs in this form have newer versions.");
        goToFormDescription();
        textPresent("(Outdated)", By.id("question_0_0"));
        textPresent("Select Multiple", By.id("question_0_0"));
        clickElement(By.xpath("//*[@id='question_0_0']//button[contains(@class,'updateQuestionBtn')]"));
        textPresent("FormCdeUpdateTest", By.id("mdd_question_title"));
        textPresent("letters", By.id("mq_uom_list_0"));
        textPresent("1", By.id("mdd_q_defaultAnswer"));
        textPresent("was", By.id("mdd_d_cde"));
        textPresent("was", By.id("mdd_d_answers"));
        clickElement(By.id("okSelect"));
        newFormVersion();

        goToFormByName(formName);
        goToFormDescription();
        textNotPresent("(Outdated)", By.id("question_0_0"));
        textPresent("Select Multiple", By.id("question_0_0"));
    }
}
