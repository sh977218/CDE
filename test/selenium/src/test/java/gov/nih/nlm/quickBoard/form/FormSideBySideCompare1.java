package gov.nih.nlm.quickBoard.form;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormSideBySideCompare1 extends NlmCdeBaseTest {

    @Test
    public void formSideBySideCompare1() {
        String formName1 = "compareForm1";
        String formName2 = "compareForm2";

        mustBeLoggedInAs(testAdmin_username, password);
        addFormToQuickBoard(formName1);
        addFormToQuickBoard(formName2);
        hoverOverElement(findElement(By.id("boardsMenu")));
        textPresent("Quick Board (2)");
        goToQuickBoardByModule("form");
        clickElement(By.id("qb_elt_compare_0"));
        clickElement(By.id("qb_elt_compare_1"));
        clickElement(By.id("qb_compare"));

        textPresent("DCE-MRI Kinetics T1 Mapping Quality Type",
                By.xpath(getSideBySideXpath("left", "questions", "fullmatch", 1)));
        textPresent("DCE-MRI Kinetics T1 Mapping Quality Type",
                By.xpath(getSideBySideXpath("right", "questions", "fullmatch", 1)));
        textPresent("Tumor Characteristics: T1 Sig",
                By.xpath(getSideBySideXpath("left", "questions", "partialmatch", 1)));
        textPresent("Tumor T1 Signal Intensity Category",
                By.xpath(getSideBySideXpath("right", "questions", "partialmatch", 1)));
        textPresent("Pain location anatomic site",
                By.xpath(getSideBySideXpath("left", "questions", "partialmatch", 2)));
        textPresent("Pain location anatomic site",
                By.xpath(getSideBySideXpath("right", "questions", "partialmatch", 2)));
        clickElement(By.id("closeCompareSideBySideBtn"));

        clickElement(By.id("qb_form_empty"));
        textPresent("Form QuickBoard (0)");
    }

}
