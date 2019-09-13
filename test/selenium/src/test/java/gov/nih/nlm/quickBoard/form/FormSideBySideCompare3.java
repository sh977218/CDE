package gov.nih.nlm.quickBoard.form;

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
        clickElement(By.id("boardsMenu"));
        textPresent("Quick Board (2)");
        goToQuickBoardByModule("form", true);
        clickElement(By.id("qb_compare"));

        textPresent("Id:987654321", By.xpath(getSideBySideXpath("left", "identifiers", "partialMatch", 1)));
        textPresent("Id:123456789", By.xpath(getSideBySideXpath("right", "identifiers", "partialMatch", 1)));

        textPresent("Document Type:www.google.com", By.xpath(getSideBySideXpath("left", "reference documents", "partialMatch", 1)));
        textPresent("Document Type:www.reddit.com", By.xpath(getSideBySideXpath("right", "reference documents", "partialMatch", 1)));

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

