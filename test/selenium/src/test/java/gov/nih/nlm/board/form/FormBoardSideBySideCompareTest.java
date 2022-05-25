package gov.nih.nlm.board.form;

import gov.nih.nlm.board.cde.BoardTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormBoardSideBySideCompareTest extends BoardTest{

    @Test
    public void formBoardSideBySideCompare() {

        String boardName = "Form Compare Board";
        mustBeLoggedInAs(testEditor_username, password);
        createBoard(boardName, "Test Compare", "form");

        formBoardSideBySideCompare1(boardName);
        formBoardSideBySideCompare2(boardName);
        formBoardSideBySideCompare3(boardName);
        formBoardSideBySideIds(boardName);

        gotoMyBoards();

        clickElement(By.xpath("//*[@id='" + boardName + "']//*[contains(@class,'deleteBoard')]"));
        clickElement(By.id("saveDeleteBoardBtn"));
        checkAlert("Deleted.");
        textNotPresent(boardName);
    }

    private void formBoardSideBySideCompare1(String boardName) {
        String formName1 = "compareForm1";
        String formName2 = "compareForm2";

        goToFormByName(formName1);
        clickElement(By.id("addToBoard"));
        textPresent("Pinned to " + boardName);

        goToFormByName(formName2);
        clickElement(By.id("addToBoard"));
        textPresent("Pinned to " + boardName);


        goToBoard(boardName);

        clickElement(By.id("elt_compare_0"));
        clickElement(By.id("elt_compare_1"));
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
    }

    private void formBoardSideBySideCompare2(String boardName) {
        String formName3 = "compareForm3";
        String formName4 = "compareForm4";

        goToFormByName(formName3);
        clickElement(By.id("addToBoard"));
        textPresent("Pinned to " + boardName);

        goToFormByName(formName4);
        clickElement(By.id("addToBoard"));
        textPresent("Pinned to " + boardName);

        goToBoard(boardName);

        clickElement(By.id("elt_compare_2"));
        clickElement(By.id("elt_compare_3"));

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
    }

    private void formBoardSideBySideCompare3(String boardName) {
        String formName = "emptyForm";

        goToFormByName(formName);
        clickElement(By.id("addToBoard"));
        textPresent("Pinned to " + boardName);
        goToBoard(boardName);

        clickElement(By.id("elt_compare_0"));
        clickElement(By.id("elt_compare_4"));
        clickElement(By.id("qb_compare"));

        textPresent("Tumor Characteristics: T1 Sig",
                By.xpath(getSideBySideXpath("left", "questions", "notmatch", 1)));
        textPresent("Pain location anatomic site",
                By.xpath(getSideBySideXpath("left", "questions", "notmatch", 2)));
        textPresent("DCE-MRI Kinetics T1 Mapping Quality Type",
                By.xpath(getSideBySideXpath("left", "questions", "notmatch", 3)));
        clickElement(By.id("closeCompareSideBySideBtn"));

    }

    private void formBoardSideBySideIds(String boardName) {
        driver.get(baseUrl + "/form/search?q=7JUBzySHFg");
        clickElement(By.id("pinToBoard_0"));
        textPresent("Pinned to " + boardName);

        driver.get(baseUrl + "/form/search?q=my7rGyrBYx");
        clickElement(By.id("pinToBoard_0"));
        textPresent("Pinned to " + boardName);

        goToBoard(boardName);
        clickElement(By.id("elt_compare_5"));
        clickElement(By.id("elt_compare_6"));
        clickElement(By.id("qb_compare"));
        textPresent("F0919");
        textPresent("F0954");
        clickElement(By.id("closeCompareSideBySideBtn"));
    }

}
