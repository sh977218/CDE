package gov.nih.nlm.form.test.description;

import gov.nih.nlm.form.test.QuestionTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormAddSuggestedCdeTest extends QuestionTest {
    @Test
    public void formAddSuggestedCde() {
        String form = "formAddSuggestedCdeTest";
        String cdeName1 = "brocco";
        String cdeName2 = "Height measureme";
        String cdeName3 = "Gastrointestinal therapy continuous";
        String cdeName4 = "Diary day headache indic";
        mustBeLoggedInAs(nlm_username, nlm_username);
        goToFormByName(form);
        goToFormDescription();

        addCdeByNameBeforeId(cdeName1, "question_0_0", true);
        textPresent("Broccoli (1/2 cup)", By.xpath("//*[@id='question_0_0']//*[contains(@class,'questionLabel')]"));

        addCdeByNameBeforeId(cdeName2, "question_0_1", true);
        textPresent("Height (Specify)", By.xpath("//*[@id='question_0_2']//*[contains(@class,'questionLabel')]"));
        textPresent("Number", By.xpath("//*[@id='question_0_2']//*[contains(@class,'questionDataType')]"));

        addCdeByNameBeforeId(cdeName3, "question_0_2", true);
        textPresent("Continuous feeding start time", By.xpath("//*[@id='question_0_3']//*[contains(@class,'questionLabel')]"));
        textPresent("Date", By.xpath("//*[@id='question_0_3']//*[contains(@class,'questionDataType')]"));

        addCdeByNameBeforeId(cdeName4, "question_0_3", true);
        textPresent("Migraine", By.xpath("//*[@id='question_0_4']//*[contains(@class,'questionLabel')]"));
        saveEditQuestionById("question_0_4");
        textPresent("YesNoUnknown", By.xpath("//*[@id='question_0_4']//*[contains(@class,'card-body')]//*[contains(@class,'answerList')]"));

    }


}
