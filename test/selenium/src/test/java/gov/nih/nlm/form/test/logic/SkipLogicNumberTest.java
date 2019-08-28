package gov.nih.nlm.form.test.logic;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class SkipLogicNumberTest extends BaseFormTest {
    String formName = "Skip Logic Number Test Form";

    @Test
    public void deleteSkipLogicNumberTest() {
        String questionId = "question_0-2";
        String cdeName = "Person Gender Text Type";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        goToPreview();
        togglePrintableLogic();
        textNotPresent(cdeName);
        findElement(By.xpath("//*[@id='Greatest Dimension_0-0_box']")).sendKeys("2");
        textPresent(cdeName);

        goToFormDescription();
        startEditQuestionById(questionId);
        deleteSkipLogicById(questionId);
        saveEditQuestionById(questionId);

        goToPreview();
        togglePrintableLogic();
        findElement(By.xpath("//*[@id='Greatest Dimension_0-0_box']")).clear();
        textPresent(cdeName);
        findElement(By.xpath("//*[@id='Greatest Dimension_0-0_box']")).sendKeys("2");
        textPresent(cdeName);

    }

    @Test
    public void addSkipLogicNumberTest() {
        String questionId = "question_0-3";
        String cdeName = "Noncompliant Reason Text";

        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        goToPreview();
        togglePrintableLogic();
        textPresent(cdeName);
        findElement(By.xpath("//*[@id='Additional Dimension_0-1_box']")).sendKeys("4");
        textPresent(cdeName);

        goToFormDescription();
        startEditQuestionById(questionId);
        addSkipLogicById(questionId, "Additional Dimension", "<", "3", "number");
        saveEditQuestionById(questionId);

        goToPreview();
        togglePrintableLogic();
        findElement(By.xpath("//*[@id='Additional Dimension_0-1_box']")).clear();
        textPresent(cdeName);
        findElement(By.xpath("//*[@id='Additional Dimension_0-1_box']")).sendKeys("4");
        textNotPresent(cdeName);
    }
}
