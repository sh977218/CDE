package gov.nih.nlm.form.test.merge;

import gov.nih.nlm.board.cde.BoardTest;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class SourceFormHasMoreQuestionCannotMergeForm extends BoardTest {

    @Test
    public void sourceFormHasMoreQuestionCannotMergeForm() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        String form1 = "Patient Health Questionnaire-2 (PHQ-2) More Questions";
        String form2 = "Patient Health Questionnaire 2 item (PHQ-2) [Reported]";

        String boardName = "SourceFormMoreQuestions";

        goToFormByName(form1);
        clickElement(By.id("addToBoard"));
        clickBoardHeaderByName(boardName);
        checkAlert("Added to Board");

        goToFormByName(form2);
        clickElement(By.id("addToBoard"));
        clickBoardHeaderByName(boardName);
        checkAlert("Added to Board");

        goToBoard(boardName);

        clickElement(By.id("qb_compare"));
        clickElement(By.xpath("//*[contains(@class,'leftObj')]//*[contains(@class,'mergeForm')]"));
        textPresent("Form merge from has too many questions", By.id("mergeFormErrorDiv"));

        clickElement(By.id("removeLeftQuestion_3"));
        textNotPresent("Form merge from has too many questions");
    }
}
