package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import junit.framework.Assert;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormQuickBoardTest1 extends NlmCdeBaseTest {

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
        clickElement(By.id("qb_form_compare"));
        textPresent("You may only compare 2 elements side by side.");
        clickElement(By.id("qb_form_empty"));
        textPresent("Form QuickBoard (0)");
    }

    @Test
    public void cdeLessElementsNoSideBySideCompare() {
        mustBeLoggedOut();
        addFormToQuickBoard("Family History - SMA");
        textPresent("Quick Board (1)");
        addFormToQuickBoard("Anatomical Functional Imaging");
        textPresent("Quick Board (2)");
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
    public void doubleElementedQuickboard(){
        addCdeToQuickBoard("King-Devick Concussion Screening Test (K-D Test)");
        addCdeToQuickBoard("Hamilton Anxiety Rating Scale (HAM-A)");
        textPresent("Quick Board (2)");
        goToQuickBoardByModule("form");
        clickElement(By.id("qb_form_compare"));
        textPresent("Baseline Attempt Time #1 Total Time");
        textPresent("Contains data elements which rate the severity of the participant/subject's level of anxiety. (Examples of CDEs included: Anxious mood; Tension; Fears; etc.)");
    }

}
