package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class EmptyAnswers extends NlmCdeBaseTest {

    @Test
    public void emptyAnswers() {
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName("Stroke Symptoms/Comorbid Events");
        clickElement(By.id("description_tab"));
        textPresent("Answer Choices:", By.id("question_0_0"));
        clickElement(By.cssSelector("#question_0_0 .fa-pencil"));
        clickElement(By.xpath("//*[@id='question_0_0']//button[. = 'Clear all']"));
        clickElement(By.cssSelector("#question_0_0 .fa-check"));
        textNotPresent("Answer Choices:", By.id("question_0_0"));
    }

}
