package gov.nih.nlm.quickBoard.form;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormLessElementsNoSideBySideCompareTest extends NlmCdeBaseTest {
    @Test
    public void formMoreElementsNoSideBySideCompare() {
        String formName1 = "Family History - SMA";
        String formName2 = "Anatomical Functional Imaging";
        String formName3 = "Tinnitus Functional Index (TFI)";
        addFormToQuickBoard(formName1);
        clickElement(By.id("boardsMenu"));
        textPresent("Quick Board (1)");
        addFormToQuickBoard(formName2);
        clickElement(By.id("boardsMenu"));
        textPresent("Quick Board (2)");
        addFormToQuickBoard(formName3);
        clickElement(By.id("boardsMenu"));
        textPresent("Quick Board (3)");
        goToQuickBoardByModule("form", true);
        clickElement(By.id("qb_elt_compare_0"));
        clickElement(By.id("qb_compare"));
        textPresent("Please select only two elements to compare.");
        clickElement(By.id("qb_form_empty"));
        textPresent("Form QuickBoard (0)");
    }
}
