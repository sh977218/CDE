package gov.nih.nlm.form.test.logic;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class SkipLogicTextTest extends BaseFormTest {
    String formName = "Skip Logic Text Test Form";

    @Test
    public void deleteSkipLogicTextTest() {
        String questionId = "question_0-2";
        String cdeName = "Person Gender Text Type";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        goToPreview();
        togglePrintableLogic();
        textNotPresent(cdeName);
        findElement(By.xpath("//*[@id='Other, specify_0-0_box']")).sendKeys("abcde");
        textPresent(cdeName);

        goToFormDescription();
        startEditQuestionById(questionId);
        deleteSkipLogicById(questionId);
        saveEditQuestionById(questionId);

        goToPreview();
        togglePrintableLogic();
        findElement(By.xpath("//*[@id='Other, specify_0-0_box']")).clear();
        textPresent(cdeName);
        findElement(By.xpath("//*[@id='Other, specify_0-0_box']")).sendKeys("abcde");
        textPresent(cdeName);

    }

    @Test
    public void addSkipLogicTextTest() {
        String questionId = "question_0-3";
        String cdeName = "Noncompliant Reason Text";

        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        goToPreview();
        togglePrintableLogic();
        textPresent(cdeName);
        findElement(By.xpath("//*[@id='AIS grade_0-1_box']")).sendKeys("show question 4");
        textPresent(cdeName);

        goToFormDescription();
        startEditQuestionById(questionId);
        addSkipLogicById(questionId, "AIS grade", "=", "show question 4", "text");
        saveEditQuestionById(questionId);

        goToPreview();
        togglePrintableLogic();
        findElement(By.xpath("//*[@id='AIS grade_0-1_box']")).clear();
        findElement(By.xpath("//*[@id='AIS grade_0-1_box']")).sendKeys("s");
        textNotPresent(cdeName);
        findElement(By.xpath("//*[@id='AIS grade_0-1_box']")).sendKeys("how question 4");
        textPresent(cdeName);
    }
}
