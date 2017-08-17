package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import junit.framework.Assert;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormSideBySideCompare extends NlmCdeBaseTest {

    @Test
    public void formSideBySideCompare1() {
        mustBeLoggedInAs(testAdmin_username, password);
        addFormToQuickBoard("compareForm1");
        textPresent("Quick Board (1)");
        addFormToQuickBoard("compareForm2");
        textPresent("Quick Board (2)");
        goToQuickBoardByModule("form");
        clickElement(By.id("qb_elt_compare_0"));
        clickElement(By.id("qb_elt_compare_1"));
        clickElement(By.id("qb_compare"));

        textPresent("DCE-MRI Kinetics T1 Mapping Quality Type", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][1]//*[contains(@class, 'rightObj') and @data-title='Label']"));
        textPresent("Tumor Characteristics: T1 Sig", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][2]//*[contains(@class, 'leftObj') and @data-title='Label']"));
        Assert.assertTrue(driver.findElements(By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'leftObj') and @data-title='Label']//*[contains(@class,'unmatchedIcon')]")).size() > 0);
        textPresent("Tumor T1 Signal Intensity Category", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][2]//*[contains(@class, 'rightObj') and @data-title='Label']"));
        Assert.assertTrue(driver.findElements(By.xpath("//*//*[@id='qb_compare_questions']//*[contains(@class, 'rightObj') and @data-title='Label']//*[contains(@class,'unmatchedIcon')]")).size() > 0);
        textPresent("Pain location anatomic site", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][3]//*[contains(@class, 'leftObj') and @data-title='Label']"));
        Assert.assertTrue(driver.findElements(By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'leftObj') and @data-title='Answer']//*[contains(@class,'unmatchedIcon')]")).size() > 0);
        textPresent("Pain location anatomic site", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][3]//*[contains(@class, 'rightObj') and @data-title='Label']"));
        Assert.assertTrue(driver.findElements(By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'rightObj') and @data-title='Answer']//*[contains(@class,'unmatchedIcon')]")).size() > 0);
        textPresent("DCE-MRI Kinetics T1 Mapping Quality Type", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][4]//*[contains(@class, 'leftObj') and @data-title='Label']"));
        clickElement(By.id("closeModal"));

        clickElement(By.id("qb_form_empty"));
        textPresent("Form QuickBoard (0)");
    }

}
