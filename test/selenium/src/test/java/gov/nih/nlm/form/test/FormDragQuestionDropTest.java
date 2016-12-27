package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormDragQuestionDropTest extends QuestionTest {
    CreateEditSectionTest sectionTest = new CreateEditSectionTest();

    @Test
    public void dragQuestionDropTest() {
        mustBeLoggedInAs(ninds_username, password);
        String formName = "JFK Coma Recovery Scale- Revised";
        goToFormByName(formName);
        textPresent("The CRS-R consists of twenty-three items comprising six hierarchically-arranged subscales addressing auditory, visual, motor, oromotor/verbal, communication and arousal functions. The lowest item on each subscale represents reflexive activity while the highest items represent cognitively-mediated behaviors.");
        clickElement(By.id("description_tab"));
        textPresent("Show Question Search Area");
        addSection("Third Section Name", "1 or more", "top");
        addSection("Second Section Name", "1 or more", "top");
        addSection("First Section Name", "0 or more", "top");
        startAddingQuestions();

        String cdeName = "Frontal Systems Behavior Scale (FrSBE) - Disinhibition subscale T score";

        addQuestionToSection(cdeName, 0);

        textPresent(cdeName, By.id("question_0_0"));


        addSectionToSection(2, 1);
        addQuestionToRootSection("Smoking History Ind", 1);
        saveForm();

        goToFormByName(formName);
        clickElement(By.id("description_tab"));
        textPresent("Number between 25 and 239", By.xpath("//*[@id='question_0_0']//*[contains(@class,'datatype')]"));
    }
}