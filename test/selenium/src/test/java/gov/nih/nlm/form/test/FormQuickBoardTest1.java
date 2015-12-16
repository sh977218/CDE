package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import junit.framework.Assert;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormQuickBoardTest1 extends NlmCdeBaseTest {

    @Test
    public void formMoreElementsNoSideBySideCompare() {
        addFormToQuickBoard("Family History - SMA");
        addFormToQuickBoard("Anatomical Functional Imaging");
        addFormToQuickBoard("Tinnitus Functional Index (TFI)");
        textPresent("Quick Board (3)");
        goToQuickBoardByModule("form");
        clickElement(By.id("qb_elt_compare_0"));
        clickElement(By.id("qb_elt_compare_1"));
        clickElement(By.id("qb_elt_compare_2"));
        clickElement(By.id("qb_form_compare"));
        textPresent("You may only compare 2 elements side by side.");
        clickElement(By.id("qb_form_empty"));
        textPresent("Form QuickBoard (0)");
    }

    @Test
    public void cdeLessElementsNoSideBySideCompare() {
        addFormToQuickBoard("Family History - SMA");
        addFormToQuickBoard("Anatomical Functional Imaging");
        addFormToQuickBoard("Tinnitus Functional Index (TFI)");
        textPresent("Quick Board (3)");
        goToQuickBoardByModule("form");
        clickElement(By.id("qb_elt_compare_0"));
        clickElement(By.id("qb_form_compare"));
        textPresent("You may only compare 2 elements side by side.");
        clickElement(By.id("qb_form_empty"));
        textPresent("Form QuickBoard (0)");
    }

    @Test
    public void formSideBySideCompare1() {
        mustBeLoggedInAs(testAdmin_username, password);
        addFormToQuickBoard("compareForm1");
        addFormToQuickBoard("compareForm2");
        textPresent("Quick Board (2)");
        goToQuickBoardByModule("form");
        clickElement(By.id("qb_elt_compare_0"));
        clickElement(By.id("qb_elt_compare_1"));
        clickElement(By.id("qb_form_compare"));


        textPresent("DCE-MRI Kinetics T1 Mapping Quality Type", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][1]//*[contains(@class, 'rightObj Label')]"));
        textPresent("Tumor Characteristics: T1 Sig", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][2]//*[contains(@class, 'leftObj Label')]"));
        Assert.assertEquals(driver.findElements(By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'leftObj Label')]//*[contains(@class,'unmatchedIcon')]")).size() > 0, true);
        textPresent("Tumor T1 Signal Intensity Category", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][2]//*[contains(@class, 'rightObj Label')]"));
        Assert.assertEquals(driver.findElements(By.xpath("//*//*[@id='qb_compare_questions']//*[contains(@class, 'rightObj Label')]//*[contains(@class,'unmatchedIcon')]")).size() > 0, true);
        textPresent("Pain location anatomic site", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][3]//*[contains(@class, 'leftObj Label')]"));
        Assert.assertEquals(driver.findElements(By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'leftObj Answer')]//*[contains(@class,'unmatchedIcon')]")).size() > 0, true);
        textPresent("Pain location anatomic site", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][3]//*[contains(@class, 'rightObj Label')]"));
        Assert.assertEquals(driver.findElements(By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'rightObj Answer')]//*[contains(@class,'unmatchedIcon')]")).size() > 0, true);
        textPresent("DCE-MRI Kinetics T1 Mapping Quality Type", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][4]//*[contains(@class, 'leftObj Label')]"));

        clickElement(By.id("qb_form_empty"));
        textPresent("Form QuickBoard (0)");
    }
}
