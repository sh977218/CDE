package gov.nih.nlm.form.test.logic;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class SkipLogicDateTest extends BaseFormTest {
    String formName = "Skip Logic Date Test Form";

    @Test
    public void deleteSkipLogicDateTest() {
        String questionId = "question_0-2";
        String cdeName = "Person Gender Text Type";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        goToPreview();
        togglePrintableLogic();
        textNotPresent(cdeName);
        findElement(By.xpath("//*[@id='Person Birth Date_0-0']")).sendKeys("02/04/2019");
        textPresent(cdeName);

        goToFormDescription();
        startEditQuestionById(questionId);
        deleteSkipLogicById(questionId);
        saveEditQuestionById(questionId);

        goToPreview();
        togglePrintableLogic();
        textPresent(cdeName);
        findElement(By.xpath("//*[@id='Person Birth Date_0-0']")).sendKeys("02/04/2019");
        textPresent(cdeName);

    }

    @Test
    public void addSkipLogicDateTest() {
        String questionId = "question_0-3";
        String cdeName = "Noncompliant Reason Text";

        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        goToPreview();
        togglePrintableLogic();
        textPresent(cdeName);
        findElement(By.xpath("//*[@id='Axillary Surgery Dissection Date_0-1_box']")).sendKeys("02/04/2019");
        textPresent(cdeName);

        goToFormDescription();
        startEditQuestionById(questionId);
        addSkipLogicById(questionId, "Axillary Surgery Dissection Date", "<", "02/05/2019", "date", null);
        saveEditQuestionById(questionId);

        goToPreview();
        togglePrintableLogic();
        textNotPresent(cdeName);
        findElement(By.xpath("//*[@id='Axillary Surgery Dissection Date_0-1_box']")).sendKeys("02/04/2019");
        textPresent(cdeName);
    }

}