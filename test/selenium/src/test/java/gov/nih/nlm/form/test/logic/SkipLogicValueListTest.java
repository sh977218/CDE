package gov.nih.nlm.form.test.logic;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class SkipLogicValueListTest extends BaseFormTest {
    String formName = "Skip Logic Value List Test Form";

    @Test
    public void deleteSkipLogicValueListTest() {
        String questionId = "question_0-2";
        String cdeName = "Person Gender Text Type";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        goToPreview();
        togglePrintableLogic();
        textNotPresent(cdeName);
        clickElement(By.xpath("(//*[@id='Distance from Closest Margin_0-0']//input[@type='radio'])[1]"));
        textPresent(cdeName);

        goToFormDescription();
        startEditQuestionById(questionId);
        deleteSkipLogicById(questionId);
        saveEditQuestionById(questionId);

        goToPreview();
        togglePrintableLogic();
        clickElement(By.xpath("(//*[@id='Distance from Closest Margin_0-0']//input[@type='radio'])[1]"));
        textPresent(cdeName);
        clickElement(By.xpath("(//*[@id='Distance from Closest Margin_0-0']//input[@type='radio'])[1]"));
        textPresent(cdeName);

    }

    @Test
    public void addSkipLogicValueListTest() {
        String questionId = "question_0-3";
        String cdeName = "Noncompliant Reason Text";

        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        goToPreview();
        togglePrintableLogic();
        textPresent(cdeName);
        clickElement(By.xpath("(//*[@id='Adrenal Gland Received_0-1']//input[@type='radio'])[1]"));
        textPresent(cdeName);

        goToFormDescription();
        startEditQuestionById(questionId);
        addSkipLogicById(questionId, "Adrenal Gland Received", "=", "Fresh", "value list");
        saveEditQuestionById(questionId);

        goToPreview();
        togglePrintableLogic();
        clickElement(By.xpath("(//*[@id='Adrenal Gland Received_0-1']//input[@type='radio'])[1]"));
        textNotPresent(cdeName);
        clickElement(By.xpath("(//*[@id='Adrenal Gland Received_0-1']//input[@type='radio'])[1]"));
        textPresent(cdeName);
    }
}
