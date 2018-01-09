package gov.nih.nlm.form.test.naming;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.testng.annotations.Test;

public class FormEditTest extends BaseFormTest {

    @Test
    public void editSectionAndQuestions() {
        String formName = "Form Edit Section And Question Test";
        mustBeLoggedInAs(testAdmin_username, password);
        goToFormByName(formName);
        goToFormDescription();
        editQuestion();
        newFormVersion();
        goHome();
    }

    private void editQuestion() {
        scrollToViewById("question_0_0");
        startEditQuestionById("question_0_0");
        clickElement(By.xpath("//*[@id='question_0_0']//i[contains(@class,'changeQuestionLabelIcon')]"));
        textPresent("Select a question label from a CDE Name");
        clickElement(By.xpath("//*[@id='q_select_name_1']/div/button"));

        String newQuestionInstruction = "New Question Instruction";
        clickElement(By.xpath("//*[@id='question_0_0']//*[contains(@class,'editQuestionInstruction')]//i[contains(@class,'fa-edit')]"));
        textPresent("Plain Text");
        textPresent("Rich Text");
        textPresent("Confirm");
        findElement(By.xpath("//*[@id='question_0_0']//*[contains(@class,'editQuestionInstruction')]//textarea")).clear();
        findElement(By.xpath("//*[@id='question_0_0']//*[contains(@class,'editQuestionInstruction')]//textarea")).sendKeys(newQuestionInstruction);
        clickElement(By.xpath("//*[@id='question_0_0']//*[contains(@class,'editQuestionInstruction')]//button[contains(text(),'Confirm')]"));
        textNotPresent("Confirm");

        saveEditQuestionById("question_0_0");
        textPresent("Data unknown text", By.xpath("//*[@id='question_0_0']//*[contains(@class,'questionLabel')]"));
        textPresent(newQuestionInstruction, By.xpath("//*[@id='question_0_0']//*[contains(@class,'questionInstruction')]"));
    }
}
