package gov.nih.nlm.form.test.merge;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class NotOwnSourceFormNotRetire extends BaseFormTest {

    @Test
    public void notOwnSourceFormNotRetire() {
        mustBeLoggedInAs(ninds_username, password);
        String form1 = "Patient Health Questionnaire - 9 (PHQ-9) Depression Scale";
        String form2 = "PHQ-9 quick depression assessment panel [Reported.PHQ]";
        addFormToQuickBoard(form1);
        addFormToQuickBoard(form2);
        goToQuickBoardByModule("form");
        clickElement(By.id("qb_form_compare"));
        clickElement(By.xpath("//*[@class='leftObj']/*[contains(@class,'mergeForm')]"));

    }
}
