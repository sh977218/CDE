package gov.nih.nlm.form.test.description;

import gov.nih.nlm.form.test.QuestionTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormAddSuggestedCdeTest extends QuestionTest {
    @Test
    public void formAddCde() {
        String form = "formAddSuggestedCdeTest";
        String cdeName1 = "patien";
        String cdeName2 = "Height measureme";
        String cdeName3 = "Gastrointestinal therapy continuous feed end t";
        String cdeName4 = "Diary day headache indic";
        mustBeLoggedInAs(nlm_username, nlm_username);
        goToFormByName(form);
        goToFormDescription();
        addCdeByPartialNameBeforeId(cdeName1, "question_0_0");
        textPresent("Retreatment Patient Request Type", By.xpath("//*[@id='question_0_0']//*[contains(@class,'questionLabel')]"));

        addCdeByPartialNameBeforeId(cdeName2, "question_0_1");
        textPresent("Height (Specify)", By.xpath("//*[@id='question_0_1']//*[contains(@class,'questionLabel')]"));
        textPresent("Number", By.xpath("//*[@id='question_0_1']//*[contains(@class,'questionDataType')]"));

        addCdeByPartialNameBeforeId(cdeName3, "question_0_2");
        textPresent("Continuous feeding end time", By.xpath("//*[@id='question_0_2']//*[contains(@class,'questionLabel')]"));
        textPresent("Date", By.xpath("//*[@id='question_0_2']//*[contains(@class,'questionDataType')]"));

        addCdeByPartialNameBeforeId(cdeName4, "question_0_3");
        textPresent("Migraine", By.xpath("//*[@id='question_0_3']//*[contains(@class,'questionLabel')]"));
        saveEditQuestionById("question_0_3");
        textPresent("YesNoUnknown", By.xpath("//*[@id='question_0_3']//*[contains(@class,'card-body')]//*[contains(@class,'answerList')]"));

    }


}
