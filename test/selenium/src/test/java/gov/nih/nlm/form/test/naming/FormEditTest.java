package gov.nih.nlm.form.test.naming;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class FormEditTest extends BaseFormTest {

    @Test
    public void editSectionAndQuestions() {
        String formName = "Form Edit Section And Question Test";
        mustBeLoggedInAs(testAdmin_username, password);
        goToFormByName(formName);
        goToFormDescription();
        Assert.assertEquals(driver.getTitle(), "Form: " + formName);
        String newQuestionInstruction = "New Question Instruction";
        editQuestion(newQuestionInstruction);
        saveFormEdit();
        newFormVersion();
        goHome();

        // Form Audit
        openAuditForm(formName);
        textPresent(newQuestionInstruction);
    }

    private void editQuestion(String text) {
        scrollToViewById("question_0-0");
        startEditQuestionById("question_0-0");
        selectQuestionLabelByIndex("question_0-0", 1);


        clickElement(By.xpath("//*[@id='question_0-0']//*[contains(@class,'editQuestionInstruction')]//mat-icon[normalize-space() = 'edit']"));
        textPresent("Plain Text");
        textPresent("Rich Text");
        textPresent("Confirm");
        findElement(By.xpath("//*[@id='question_0-0']//*[contains(@class,'editQuestionInstruction')]//textarea")).clear();
        findElement(By.xpath("//*[@id='question_0-0']//*[contains(@class,'editQuestionInstruction')]//textarea")).sendKeys(text);
        clickElement(By.xpath("//*[@id='question_0-0']//*[contains(@class,'editQuestionInstruction')]//button[contains(text(),'Confirm')]"));
        textNotPresent("Confirm");

        saveEditQuestionById("question_0-0");
        textPresent("Data unknown text", By.xpath("//*[@id='question_0-0']//*[contains(@class,'questionLabel')]"));
        textPresent(text, By.xpath("//*[@id='question_0-0']//*[contains(@class,'questionInstruction')]"));
    }
}
