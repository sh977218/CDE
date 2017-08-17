package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormSideBySide extends NlmCdeBaseTest {

    @Test
    public void formMoreElementsNoSideBySideCompare() {
        mustBeLoggedOut();
        addFormToQuickBoard("Family History - SMA");
        textPresent("Quick Board (1)");
        addFormToQuickBoard("Anatomical Functional Imaging");
        textPresent("Quick Board (2)");
        addFormToQuickBoard("Tinnitus Functional Index (TFI)");
        textPresent("Quick Board (3)");
        goToQuickBoardByModule("form");
        clickElement(By.id("qb_elt_compare_0"));
        clickElement(By.id("qb_elt_compare_1"));
        clickElement(By.id("qb_elt_compare_2"));
        clickElement(By.id("qb_compare"));
        textPresent("You may only compare 2 elements side by side.");
        clickElement(By.id("qb_form_empty"));
        textPresent("Form QuickBoard (0)");
    }

    @Test
    public void formLessElementsNoSideBySideCompare() {
        mustBeLoggedOut();
        addFormToQuickBoard("Family History - SMA");
        textPresent("Quick Board (1)");
        addFormToQuickBoard("Anatomical Functional Imaging");
        textPresent("Quick Board (2)");
        addFormToQuickBoard("Tinnitus Functional Index (TFI)");
        textPresent("Quick Board (3)");
        goToQuickBoardByModule("form");
        clickElement(By.id("qb_elt_compare_0"));
        clickElement(By.id("qb_compare"));
        textPresent("You may only compare 2 elements side by side.");
        clickElement(By.id("qb_form_empty"));
        textPresent("Form QuickBoard (0)");
    }

}
