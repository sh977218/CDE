package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormSideBySideCompare2 extends NlmCdeBaseTest {

    @Test
    public void formSideBySideCompare2() {
        mustBeLoggedInAs(testAdmin_username, password);
        addFormToQuickBoard("compareForm1");
        addFormToQuickBoard("emptyForm");
        textPresent("Quick Board (2)");
        goToQuickBoardByModule("form");
        clickElement(By.id("qb_elt_compare_0"));
        clickElement(By.id("qb_elt_compare_1"));
        clickElement(By.id("qb_form_compare"));

        textPresent("Tumor Characteristics: T1 Sig", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][1]//*[contains(@class, 'leftObj') and @data-title='Label']"));
        textPresent("Pain location anatomic site", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][2]//*[contains(@class, 'leftObj') and @data-title='Label']"));
        textPresent("DCE-MRI Kinetics T1 Mapping Quality Type", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][3]//*[contains(@class, 'leftObj') and @data-title='Label']"));
        clickElement(By.id("closeModal"));

        clickElement(By.id("qb_form_empty"));
        textPresent("Form QuickBoard (0)");
    }

}
