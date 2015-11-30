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
    }
}
