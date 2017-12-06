package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class QuestionDefaultValue extends NlmCdeBaseTest {

    @Test
    public void questionDefaultValue() {
        String formName = "History Data Source and Reliability";
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName(formName);
        goToFormDescription();
        startEditQuestionSectionById("question_0_0");
        new Select(driver.findElement(By.xpath("//*[@id='question_0_0']//*[contains(@class,'defaultAnswer')]/select"))).selectByVisibleText("Brother");
        saveEditQuestionSectionById("question_0_0");

        startEditQuestionSectionById("question_0_1");
        clickElement(By.xpath("//*[@id='question_0_1']//*[contains(@class,'defaultAnswer')]//i[contains(@class,'fa-edit')]"));
        findElement(By.xpath("//*[@id='question_0_1']//*[contains(@class,'defaultAnswer')]//input")).sendKeys("A default answer!");
        clickElement(By.xpath("//*[@id='question_0_1']//*[contains(@class,'defaultAnswer')]//button[contains(text(),'Confirm')]"));
        saveEditQuestionSectionById("question_0_1");
        newFormVersion();

        goToFormByName(formName);
        // this find ensures option Brother is selected.
        findElement(By.xpath("//*[*[text()='From whom/ what were the medical history data obtained']]//*[contains(.,'Brother')]"))
                .findElement(By.cssSelector("input:checked"));
        goToFormDescription();
        textPresent("Brother", By.xpath("//*[@id='question_0_0']//*[contains(@class,'defaultAnswer')]"));
        textPresent("A default answer!", By.xpath("//*[@id='question_0_1']//*[contains(@class,'defaultAnswer')]"));

    }

}
