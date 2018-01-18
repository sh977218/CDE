package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class EmptyAnswers extends NlmCdeBaseTest {

    @Test
    public void emptyAnswers() {
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName("Stroke Symptoms/Comorbid Events");
        goToFormDescription();
        textPresent("Answer Choices:", By.id("question_0_0"));
        startEditQuestionById("question_0_0");
        clickElement(By.cssSelector("#question_0_0 .formDescriptionAnswerList .select2-selection__clear"));
        saveEditQuestionById("question_0_0");
        textNotPresent("Answer Choices:", By.id("question_0_0"));
    }

}
