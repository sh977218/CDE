package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.testng.annotations.Test;

public class FormDragQuestionDropTest extends QuestionTest {
    @Test
    public void dragQuestionDropTest() {

        mustBeLoggedInAs(testEditor_username, password);
        String formName = "Drag Question Test";
        goToFormByName(formName);
        goToFormDescription();

        String cdeName = "Frontal Systems Behavior Scale (FrSBE) - Disinhibition subscale T score";
        addQuestionToSection(cdeName, 0);
        textPresent("Disinhibition subscale T score", By.id("question_0-0"));
        closeAlert();

        textPresent("N/A", By.id("section_3"));
        By sourceBy = By.xpath("//*[@id='section_2']//mat-icon[normalize-space() = 'drag_handle']");
        By targetBy = By.xpath("//*[@id='section_1']//*[contains(@class,'node-content-wrapper')]");
        dragAndDrop(sourceBy, targetBy);

        textPresent("N/A", By.id("section_2"));

        addQuestionToSection("Smoking History Ind", 1);
        addQuestionToSectionByAutoComplete(1, "Patient Ethnic Group Cat", "Patient Ethnic Group Category");
        textPresent("Patient Ethnic Group Category");
        closeAlert();
        saveFormEdit();
        newFormVersion();

        goToFormByName(formName);
        goToFormDescription();
        textPresent("At least: 25", By.xpath("//*[@id='question_0-0']"));
        textPresent("At most: 239", By.xpath("//*[@id='question_0-0']"));
    }
}