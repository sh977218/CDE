package gov.nih.nlm.board.form;

import gov.nih.nlm.board.cde.BoardTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class CreateFormBoard extends BoardTest {

    @Test
    public void createFormOnlyBoard() {
        mustBeLoggedInAs(formboarduser, password);
        String boardName = "formOnlyBoard";
        String boardDefinition = "this board only has forms.";
        String formName1 = "Participant/Subject Contact Information";
        String formName2 = "Parkinson's Disease Quality of Life Scale (PDQUALIF)";
        String formName3 = "ER/Admission Therapeutic Procedures";
        createBoard(boardName, boardDefinition, "form");

        pinFormToBoard(formName1, boardName);
        pinFormToBoard(formName2, boardName);
        pinFormToBoard(formName3, boardName);

        goToBoard(boardName);

        clickElement(By.id("board.classifyAllForms"));
        new Select(findElement(By.id("selectClassificationOrg"))).selectByVisibleText("TEST");
        textPresent("Classify Board");
        clickElement(By.xpath("//*[@id='Classify Board-classifyBtn']"));
        checkAlert("All Elements classified.");
        clickElement(By.id("list_gridView"));
        textPresent("Steward");
        textPresent("Registration Status");

        switchTabAndClose(0);

        goToFormByName(formName1);

        goToClassification();
        textPresent("Classify Board");

        goToFormByName(formName2);

        goToClassification();
        textPresent("Classify Board");

        goToFormByName(formName3);

        goToClassification();
        textPresent("Classify Board");

        goToBoard(boardName);
        textPresent(formName1);
        textPresent(formName2);
        textPresent(formName3);


        // counteract save summary/table view
        try {
            clickElement(By.id("unpin_1"));
        } catch (Exception e) {
            if (driver.findElements(By.id("list_summaryView")).size() > 0)
                clickElement(By.id("list_summaryView"));
            clickElement(By.id("unpin_1"));
        }
        checkAlert("Unpinned.");
        textNotPresent(formName2);
    }
}
