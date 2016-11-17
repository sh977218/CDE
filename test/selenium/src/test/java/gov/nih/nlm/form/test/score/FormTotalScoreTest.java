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

        clickElement(By.xpath("//*[@id='Apathy Scale (AS) - effort indicator_0']//*[text()='2=Slightly']"));
        clickElement(By.xpath("//*[@id='Apathy Scale (AS) - indifference indicator_1']//*[text()='1=Slightly']"));
        clickElement(By.xpath("//*[@id='Apathy Scale (AS) - apathetic indicator_2']//*[text()='3=A lot']"));
        textPresent("Score: 6");
    }
}
