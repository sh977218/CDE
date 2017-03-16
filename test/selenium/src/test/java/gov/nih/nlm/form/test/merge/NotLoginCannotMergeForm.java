package gov.nih.nlm.form.test.merge;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class NotLoginCannotMergeForm extends BaseFormTest {

    @Test
    public void notLoginCannotMergeForm() {
        mustBeLoggedOut();
        String form1 = "Patient Health Questionnaire-2 (PHQ-2)";
        String form2 = "Patient Health Questionnaire 2 item (PHQ-2) [Reported]";

        addFormToQuickBoard(form1);
        addFormToQuickBoard(form2);
        goToQuickBoardByModule("form");
        clickElement(By.id("qb_form_compare"));
        clickElement(By.xpath("//*[@class='leftObj']/*[contains(@class,'mergeForm')]"));
        textPresent("Log in to merge", By.id("mergFormWarningDiv"));
    }
}
