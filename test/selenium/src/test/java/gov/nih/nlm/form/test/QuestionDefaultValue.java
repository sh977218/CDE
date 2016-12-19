package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class QuestionDefaultValue extends BaseFormTest {

    @Test
    public void questionDefaultValue() {
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName("History Data Source and Reliability");
        clickElement(By.id("description_tab"));
        clickElement(By.id("question_accordion_0_0"));
        new Select(driver.findElement(By.id("q_default_answer_0"))).selectByVisibleText("Brother");

        clickElement(By.id("question_accordion_0_1"));
        clickElement(By.cssSelector("#q_defaultAnswer_text_1 i"));

        findElement(By.cssSelector("#q_defaultAnswer_text_1 input")).sendKeys("A default answer!");
        clickElement(By.cssSelector("#q_defaultAnswer_text_1 .fa-check"));
        saveForm();

        goToFormByName("History Data Source and Reliability");

        // this find ensures option Brother is selected.
        findElement(By.xpath("//div[div/div/label[text()='From whom/ what were the medical history data obtained']]//label[contains(.,'Brother')]"))
                .findElement(By.cssSelector("input:checked"));
        
    }

}
