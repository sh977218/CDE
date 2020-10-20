package gov.nih.nlm.form.test.description;

import gov.nih.nlm.form.test.QuestionTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormAddSuggestedCdeTest extends QuestionTest {

    @Test
    public void formAddSuggestedCde() {
        String form = "formAddSuggestedCdeTest";
        String cdeName1 = "pronounce smile";
        String cdeName2 = "Adverse event track num";
        String cdeName3 = "Gastrointestinal therapy feed schedule start";
        String cdeName4 = "Diary day headache indic";
        mustBeLoggedInAs(nlm_username, nlm_username);
        goToFormByName(form);
        goToFormDescription();

        addCdeByNameBeforeId(cdeName1, "question_0-0", true);
        textPresent("smile", By.xpath("//*[@id='question_0-0']//*[contains(@class,'questionLabel')]"));
        closeAlert();

        addCdeByNameBeforeId(cdeName2, "question_0-1", true);
        textPresent("AE Tracking Number", By.xpath("//*[@id='question_0-2']//*[contains(@class,'questionLabel')]"));
        textPresent("Number", By.xpath("//*[@id='question_0-2']//*[contains(@class,'questionDataType')]"));
        closeAlert();

        addCdeByNameBeforeId(cdeName3, "question_0-2", true);
        textPresent("Start of Feeding Schedule", By.xpath("//*[@id='question_0-3']//*[contains(@class,'questionLabel')]"));
        textPresent("(Date)", By.xpath("//*[@id='question_0-3']//*[contains(@class,'questionDataType')]"));
        closeAlert();

        addCdeByNameBeforeId(cdeName4, "question_0-3", true);
        textPresent("Headache", By.xpath("//*[@id='question_0-4']//*[contains(@class,'questionLabel')]"));
        saveEditQuestionById("question_0-4");
        textPresent("Yes", By.xpath("//*[@id='question_0-4']//*[contains(@class,'card-body')]//*[contains(@class,'answerList')]"));
        textPresent("No", By.xpath("//*[@id='question_0-4']//*[contains(@class,'card-body')]//*[contains(@class,'answerList')]"));
        textPresent("Unknown", By.xpath("//*[@id='question_0-4']//*[contains(@class,'card-body')]//*[contains(@class,'answerList')]"));
    }

}
