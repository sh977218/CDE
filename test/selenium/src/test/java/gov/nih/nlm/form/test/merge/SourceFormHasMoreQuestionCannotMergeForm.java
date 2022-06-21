package gov.nih.nlm.form.test.merge;

import gov.nih.nlm.board.cde.BoardTest;
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
        pinToBoardFromViewPageWithModal(boardName);

        goToFormByName(form2);
        pinToBoardFromViewPageWithModal(boardName);

        goToBoard(boardName);

        clickElement(By.id("qb_compare"));
        clickElement(By.xpath("//*[contains(@class,'leftObj')]//*[@id='openMergeFormModalBtn']"));
        textPresent("Form merge from has too many questions", By.id("mergeFormErrorDiv"));

        clickElement(By.id("removeLeftQuestion_3"));
        textNotPresent("Form merge from has too many questions");
    }
}
