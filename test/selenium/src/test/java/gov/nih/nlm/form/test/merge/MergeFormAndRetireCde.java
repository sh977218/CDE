package gov.nih.nlm.form.test.merge;

import gov.nih.nlm.board.cde.BoardTest;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class MergeFormAndRetireCde extends BoardTest {

    @Test
    public void mergeFormAndRetireCde() {
        String formName1 = "PHQ-9 quick depression assessment panel [Reported.PHQ]";
        String formName2 = "Patient Health Questionnaire - 9 (PHQ-9) Depression Scale";
        mustBeLoggedInAs(nlm_username, nlm_password);

        String boardName = "MergeFormRetire";

        goToFormByName(formName1);
        clickElement(By.id("addToBoard"));
        clickBoardHeaderByName(boardName);
        checkAlert("Added to Board");

        goToFormByName(formName2);
        clickElement(By.id("addToBoard"));
        clickBoardHeaderByName(boardName);
        checkAlert("Added to Board");

        goToBoard(boardName);
        clickElement(By.id("qb_compare"));

        mergeFormBySide("left");
        clickElement(By.id("retireCde"));
        scrollToViewById("mergeFormBtn");
        clickElement(By.id("mergeFormBtn"));
        closeAlert();

        // we retire all CDEs even if they are used on a form.
        textPresent("Retired", By.id("leftQuestion_0"));
        textPresent("Retired", By.id("leftQuestion_1"));
        textPresent("Retired", By.id("leftQuestion_2"));
        textPresent("Retired", By.id("leftQuestion_3"));
        textPresent("Retired", By.id("leftQuestion_4"));
        textPresent("Retired", By.id("leftQuestion_5"));
        textPresent("Retired", By.id("leftQuestion_6"));
        textPresent("Retired", By.id("leftQuestion_7"));
        textPresent("Retired", By.id("leftQuestion_8"));
        textPresent("Retired", By.id("leftQuestion_9"));
        textPresent("Retired", By.id("leftQuestion_10"));

        goToFormByName(formName1);
        textPresent("Warning: this form is retired.");

        goToCdeByName("Trouble falling or staying asleep, or sleeping too much in last 2 weeks [Reported.PHQ]");
        textPresent("Warning: this data element is retired.");

        goToFormByName(formName2);
        goToNaming();
        textPresent(formName1);
        goToReferenceDocuments();
        textPresent("Description: Kroenke K, Spitzer RL, Williams JB. The PHQ-9: validity of a brief depression severity measure. J Gen Intern Med. 2001 Sep;16(9):606-13.");
        goToProperties();
        textPresent("CopyrightStarted");
        goToIdentifiers();
        textPresent("44249-1");
        textPresent("F0374");
        goToHistory();
        textPresent("Merge from tinyId mJsGoMU1m");
    }
}
