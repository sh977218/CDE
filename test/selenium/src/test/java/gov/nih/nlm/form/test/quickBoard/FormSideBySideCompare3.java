package gov.nih.nlm.form.test.quickBoard;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormSideBySideCompare3 extends NlmCdeBaseTest {

    @Test
    public void formSideBySideCompare3() {
        String formName1 = "compareForm3";
        String formName2 = "compareForm4";
        mustBeLoggedInAs(testAdmin_username, password);
        addFormToQuickBoard(formName1);
        addFormToQuickBoard(formName2);
        textPresent("Quick Board (2)");
        goToQuickBoardByModule("form");
        clickElement(By.id("qb_elt_compare_0"));
        clickElement(By.id("qb_elt_compare_1"));
        clickElement(By.id("qb_compare"));

        textPresent("Prostate Cancer American Joint Committee on Cancer (AJCC) Edition 7 Pathologic Regional Lymph Node N Stage",
                By.xpath(getSideBySideXpath("left", "questions", "notmatch", 1)));
        textPresent("Ethnic Group Category Text",
                By.xpath(getSideBySideXpath("left", "questions", "notmatch", 2)));

        textPresent("Adverse Event Ongoing Event Indicator",
                By.xpath(getSideBySideXpath("left", "questions", "fullmatch", 1)));
        textPresent("Adverse Event Ongoing Event Indicator",
                By.xpath(getSideBySideXpath("right", "questions", "fullmatch", 1)));
        textPresent("Noncompliant Reason Text",
                By.xpath(getSideBySideXpath("left", "questions", "fullmatch", 2)));
        textPresent("Noncompliant Reason Text",
                By.xpath(getSideBySideXpath("right", "questions", "fullmatch", 2)));
        textPresent("Race Category Text",
                By.xpath(getSideBySideXpath("left", "questions", "fullmatch", 3)));
        textPresent("Race Category Text",
                By.xpath(getSideBySideXpath("right", "questions", "fullmatch", 3)));
        clickElement(By.id("closeCompareSideBySideBtn"));

        clickElement(By.id("qb_form_empty"));
        textPresent("Form QuickBoard (0)");
    }
}

