package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormQuickBoardTest extends NlmCdeBaseTest {
    @Test
    public void formSideBySideCompare() {
        addFormToQuickBoard("compareForm1");
        addFormToQuickBoard("compareForm2");
        textPresent("Quick Board (2)");
        clickElement(By.id("menu_qb_link"));
        clickElement(By.xpath("//*[@id=\"qb_form_tab\"]/a"));
        clickElement(By.id("qb_elt_compare_0"));
        clickElement(By.id("qb_elt_compare_1"));
        clickElement(By.id("qb_form_compare"));


        textPresent("DCE-MRI Kinetics T1 Mapping Quality Type", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareModifiedArray')][1]//*[contains(@class, 'rightObj')]"));
        textPresent("Tumor T1 Signal Intensity Category", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareModifiedArray')][2]//*[contains(@class, 'leftObj')]"));
        textPresent("Tumor T1 Signal Intensity Category", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareModifiedArray')][2]//*[contains(@class, 'rightObj')]"));
        textPresent("Visible Tumor Anterior-Posterior Orientation Size 3 ", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareModifiedArray')][3]//*[contains(@class, 'leftObj')]"));
        textPresent("Visible Tumor Anterior-Posterior Orientation Size 3 ", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareModifiedArray')][3]//*[contains(@class, 'rightObj')]"));
        textPresent("DCE-MRI Kinetics T1 Mapping Quality Type", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareModifiedArray')][4]//*[contains(@class, 'leftObj')]"));

        clickElement(By.id("qb_cde_empty"));
        textPresent("Quick Board (0)");
    }
}
