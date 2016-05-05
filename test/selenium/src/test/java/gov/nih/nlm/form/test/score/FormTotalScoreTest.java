package gov.nih.nlm.form.test.score;

import gov.nih.nlm.form.test.BaseFormTest;
import gov.nih.nlm.system.RecordVideo;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

import java.util.List;

public class FormTotalScoreTest extends BaseFormTest {

    @Test
    public void formTotalScore() {
        mustBeLoggedInAs(testAdmin_username, password);
        String formName = "Apathy Scale (AS)";
        goToFormByName(formName);
        clickElement(By.linkText("native"));
        textPresent("Score: Incomplete answers");

        WebElement scoreSection = findElement(By.id("formRenderSection_Score Section"));
        List<WebElement> selects = scoreSection.findElements(By.tagName("select"));
        new Select(selects.get(0)).selectByValue("string:2");
        new Select(selects.get(1)).selectByValue("string:1");
        new Select(selects.get(2)).selectByValue("string:3");
        textPresent("Score: 6");
    }
}
