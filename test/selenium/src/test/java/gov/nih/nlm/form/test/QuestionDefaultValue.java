package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class QuestionDefaultValue extends NlmCdeBaseTest {

    @Test
    public void questionDefaultValue() {
        String formName = "History Data Source and Reliability";
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName(formName);
        goToFormDescription();
        startEditQuestionById("question_0-0");
        nonNativeSelect("//*[@id='question_0-0']//dt[contains(.,'Default Answer')]/following-sibling::dd[1]",
                "Select Default Answer", "Brother");
        saveEditQuestionById("question_0-0");

        startEditQuestionById("question_0-1");
        clickElement(By.xpath("//*[@id='question_0-1']//*[contains(@class,'defaultAnswer')]//mat-icon[normalize-space() = 'edit']"));
        findElement(By.xpath("//*[@id='question_0-1']//*[contains(@class,'defaultAnswer')]//input")).sendKeys("A default answer!");
        clickElement(By.xpath("//*[@id='question_0-1']//*[contains(@class,'defaultAnswer')]//button[contains(text(),'Confirm')]"));
        saveEditQuestionById("question_0-1");
        newFormVersion();

        goToFormByName(formName);
        // this find ensures option Brother is selected.
        findElement(By.xpath("//*[*[normalize-space()='From whom/ what were the medical history data obtained']]//label[contains(.,'Brother')]"))
                .findElement(By.cssSelector("input:checked"));
        goToFormDescription();
        textPresent("Brother", By.xpath("//*[@id='question_0-0']//*[contains(@class,'defaultAnswer')]"));
        textPresent("A default answer!", By.xpath("//*[@id='question_0-1']//*[contains(@class,'defaultAnswer')]"));
    }

}
