package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.testng.annotations.Test;

public class FormDragQuestionDropTest extends QuestionTest {
    @Test
    public void dragQuestionDropTest() {

        mustBeLoggedInAs(ninds_username, password);
        String formName = "JFK Coma Recovery Scale- Revised";
        goToFormByName(formName);
        goToFormDescription();
        addSectionTop("Third Section Name", null);
        addSectionTop("Second Section Name", null);
        addSectionTop("First Section Name", null);

        String cdeName = "Frontal Systems Behavior Scale (FrSBE) - Disinhibition subscale T score";
        addQuestionToSection(cdeName, 0);
        textPresent(cdeName, By.id("question_0_0"));

        WebElement sourceElt = findElement(By.xpath("//*[@id='section_2']//i[contains(@class,'fa fa-arrows')]"));
        WebElement targetElt = findElement(By.xpath("//*[@id='section_1']//*[contains(@class,'node-content-wrapper')]"));
        (new Actions(driver)).moveToElement(targetElt).perform(); // scroll into view
        dragAndDrop(sourceElt, targetElt);

        textPresent("N/A", By.id("section_2"));

        addQuestionToSection("Smoking History Ind", 1);
        newFormVersion();

        goToFormByName(formName);
        goToFormDescription();
        textPresent("At least: 25", By.xpath("//*[@id='question_0_0']"));
        textPresent("At most: 239", By.xpath("//*[@id='question_0_0']"));
    }
}