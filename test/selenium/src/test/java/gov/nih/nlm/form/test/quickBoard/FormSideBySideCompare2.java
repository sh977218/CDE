package gov.nih.nlm.form.test.quickBoard;

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
        clickElement(By.id("qb_compare"));

        textPresent("Tumor Characteristics: T1 Sig",
                By.xpath(getSideBySideXpath("right", "questions", "notmatch", 1)));
        textPresent("Pain location anatomic site",
                By.xpath(getSideBySideXpath("right", "questions", "notmatch", 2)));
        textPresent("DCE-MRI Kinetics T1 Mapping Quality Type",
                By.xpath(getSideBySideXpath("right", "questions", "notmatch", 3)));
        clickElement(By.id("closeCompareSideBySideBtn"));

        clickElement(By.id("qb_form_empty"));
        textPresent("Form QuickBoard (0)");
    }

}
