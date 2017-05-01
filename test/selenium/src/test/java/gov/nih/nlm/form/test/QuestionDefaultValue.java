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
        startEditQuestionSectionById("question_0_0");
        new Select(driver.findElement(By.xpath("//*[@id='question_0_0']//*[contains(@class,'defaultAnswer')]"))).selectByVisibleText("Brother");
        saveEditQuestionSectionById("question_0_0");

        startEditQuestionSectionById("question_0_1");
        clickElement(By.xpath("//*[@id='question_0_1']//*[contains(@class,'defaultAnswer')]//i[contains(@class,'fa-edit')]"));
        findElement(By.xpath("//*[@id='question_0_1']//*[contains(@class,'defaultAnswer')]//input")).sendKeys("A default answer!");
        clickElement(By.xpath("//*[@id='question_0_1']//*[contains(@class,'defaultAnswer')]//button[contains(text(),'Confirm')]"));
        saveEditQuestionSectionById("question_0_1");

        saveForm();

        goToFormByName("History Data Source and Reliability");
        // this find ensures option Brother is selected.
        findElement(By.xpath("//*[*[text()='From whom/ what were the medical history data obtained']]//*[contains(.,'Brother')]"))
                .findElement(By.cssSelector("input:checked"));

        clickElement(By.id("description_tab"));
        textPresent("Default Answer: Brother", By.xpath("//*[@id='question_0_0']//*[contains(@class,'defaultAnswer')]"));
        textPresent("Default Answer: A default answer!", By.xpath("//*[@id='question_0_1']//*[contains(@class,'defaultAnswer')]"));

    }

}
