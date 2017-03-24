package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormDragQuestionDropTest extends QuestionTest {
    @Test
    public void dragQuestionDropTest() {

        mustBeLoggedInAs(ninds_username, password);
        String formName = "JFK Coma Recovery Scale- Revised";
        goToFormByName(formName);
        textPresent("The CRS-R consists of twenty-three items comprising six hierarchically-arranged subscales addressing auditory, visual, motor, oromotor/verbal, communication and arousal functions. The lowest item on each subscale represents reflexive activity while the highest items represent cognitively-mediated behaviors.");
        clickElement(By.id("description_tab"));
        textPresent("Show Question Search Area");
        addSectionTop("Third Section Name", "1 or more");
        addSectionTop("Second Section Name", "1 or more");
        addSectionTop("First Section Name", "0 or more");
        startAddingQuestions();

        String cdeName = "Frontal Systems Behavior Scale (FrSBE) - Disinhibition subscale T score";

        addQuestionToSection(cdeName, 0);

        textPresent(cdeName, By.id("question_0_0"));

        addSectionToSection(2, 1);
        addQuestionToRootSection("Smoking History Ind", 1);
        saveForm();

        goToFormByName(formName);
        clickElement(By.id("description_tab"));
        textPresent("At least: 25", By.xpath("//*[@id='question_0_0']"));
        textPresent("At most: 239", By.xpath("//*[@id='question_0_0']"));
    }
}