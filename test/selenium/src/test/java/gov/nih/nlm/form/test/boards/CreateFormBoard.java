package gov.nih.nlm.form.test.boards;

import gov.nih.nlm.cde.test.boards.BoardTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class CreateFormBoard extends BoardTest {

    @Test
    public void createFormOnlyBoard() {
        mustBeLoggedInAs(formboarduser, password);
        String boardName = "formOnlyBoard";
        String formName1 = "Participant/Subject Contact Information";
        String formName2 = "Parkinson's Disease Quality of Life Scale (PDQUALIF)";
        String formName3 = "Parkinson's Disease Medication Log";
        createBoard(boardName, "this board only has forms.", "form");

        pinFormToBoard(formName1, boardName);
        pinFormToBoard(formName2, boardName);
        pinFormToBoard(formName3, boardName);

        goToBoard(boardName);

        clickElement(By.id("board.classifyAllForms"));
        new Select(findElement(By.id("selectClassificationOrg"))).selectByVisibleText("TEST");
        textPresent("Classify Board");
        clickElement(By.xpath("//div[@id='addClassification-Classify Board']/button"));
        textPresent("All Elements classified.");
        closeAlert();
        clickElement(By.id("form_gridView"));
        textPresent("Other Names");
        textPresent("Registration Status");

        goToFormByName(formName1);
        showAllTabs();
        clickElement(By.id("classification_tab"));
        textPresent("Classify Board");

        goToFormByName(formName2);
        showAllTabs();
        clickElement(By.id("classification_tab"));
        textPresent("Classify Board");

        goToFormByName(formName3);
        showAllTabs();
        clickElement(By.id("classification_tab"));
        textPresent("Classify Board");

    }
}
