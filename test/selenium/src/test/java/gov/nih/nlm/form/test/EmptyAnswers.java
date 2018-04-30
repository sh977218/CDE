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
        textPresent("Answer Choices:", By.id("question_0-0"));
        startEditQuestionById("question_0-0");
        clickElement(By.xpath("//*[@id='question_0-0']//*[contains(@class,'answerList')]/ng-select//*[@title='Clear all']"));
        saveEditQuestionById("question_0-0");
        textNotPresent("Answer Choices:", By.id("question_0-0"));
    }

}
