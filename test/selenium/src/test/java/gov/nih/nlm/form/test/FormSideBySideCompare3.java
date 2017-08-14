package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormSideBySideCompare3 extends NlmCdeBaseTest {

    @Test
    public void formSideBySideCompare3() {
        mustBeLoggedInAs(testAdmin_username, password);
        addFormToQuickBoard("compareForm3");
        addFormToQuickBoard("compareForm4");
        textPresent("Quick Board (2)");
        goToQuickBoardByModule("form");
        clickElement(By.id("qb_elt_compare_0"));
        clickElement(By.id("qb_elt_compare_1"));
        clickElement(By.id("qb_form_compare"));

        textPresent("Prostate Cancer American Joint Committee on Cancer (AJCC) Edition 7 Pathologic Regional Lymph Node N Stage", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class,'quickBoardContentCompareArray')][1]//*[contains(@class, 'leftObj') and @data-title='Label']"));
        textPresent("Adverse Event Ongoing Event Indicator", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][2]//*[contains(@class, 'leftObj') and @data-title='Label']"));
        textPresent("Adverse Event Ongoing Event Indicator", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][2]//*[contains(@class, 'rightObj') and @data-title='Label']"));
        textPresent("Noncompliant Reason Text", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][3]//*[contains(@class, 'leftObj') and @data-title='Label']"));
        textPresent("Noncompliant Reason Text", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][3]//*[contains(@class, 'rightObj') and @data-title='Label']"));
        textPresent("Race Category Text", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][4]//*[contains(@class, 'leftObj') and @data-title='Label']"));
        textPresent("Race Category Text", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][4]//*[contains(@class, 'leftObj') and @data-title='Label']"));
        textPresent("Ethnic Group Category Text", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][5]//*[contains(@class, 'leftObj') and @data-title='Label']"));
        clickElement(By.id("closeModal"));

        clickElement(By.id("qb_form_empty"));
        textPresent("Form QuickBoard (0)");
    }
}

