package gov.nih.nlm.form.test.merge;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class SourceFormHasMoreQuestionCannotMergeForm extends NlmCdeBaseTest {

    @Test
    public void sourceFormHasMoreQuestionCannotMergeForm() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        String form1 = "Patient Health Questionnaire-2 (PHQ-2) More Questions";
        String form2 = "Patient Health Questionnaire 2 item (PHQ-2) [Reported]";

        addFormToQuickBoardByTinyId(form1);
        addFormToQuickBoardByTinyId(form2);
        goToQuickBoardByModule("form");
        clickElement(By.id("qb_form_compare"));
        clickElement(By.xpath("//*[@class='leftObj']/*[contains(@class,'mergeForm')]"));
        textPresent("Form merge from has too many questions", By.id("mergeFormWarningDiv"));

        clickElement(By.id("removeLeftQuestion_3"));
        textNotPresent("Form merge from has too many questions");
    }
}
