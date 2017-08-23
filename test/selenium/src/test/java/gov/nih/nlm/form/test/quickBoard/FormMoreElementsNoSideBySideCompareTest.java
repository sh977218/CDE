package gov.nih.nlm.form.test.quickBoard;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormMoreElementsNoSideBySideCompareTest extends NlmCdeBaseTest {
    @Test
    public void formMoreElementsNoSideBySideCompare() {
        String formName1 = "Family History - SMA";
        String formName2 = "Anatomical Functional Imaging";
        String formName3 = "Tinnitus Functional Index (TFI)";
        mustBeLoggedOut();
        addFormToQuickBoard(formName1);
        textPresent("Quick Board (1)");
        addFormToQuickBoard(formName2);
        textPresent("Quick Board (2)");
        addFormToQuickBoard(formName3);
        textPresent("Quick Board (3)");
        goToQuickBoardByModule("form");
        clickElement(By.id("qb_elt_compare_0"));
        clickElement(By.id("qb_elt_compare_1"));
        clickElement(By.id("qb_elt_compare_2"));
        clickElement(By.id("qb_compare"));
        textPresent("Please select only two elements to compare.");
        clickElement(By.id("qb_form_empty"));
        textPresent("Form QuickBoard (0)");
    }
}
