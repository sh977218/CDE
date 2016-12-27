package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class FormEditTest extends BaseFormTest {

    @Test
    public void editSectionAndQuestions() {
        mustBeLoggedInAs(testAdmin_username, password);
        String formName = "Form Edit Section And Question Test";
        goToFormByName(formName);
        clickElement(By.id("description_tab"));
        editSection();
        editQuestion();
        saveForm();
        goHome();
    }

    private void editSection() {
        String newSectionName = "New Main Section";
        startEditQuestionSectionById("section_0");
        clickElement(By.xpath("//*[@id='section_0']//*[contains(@class,'section_title')]//i[contains(@class,'fa-edit')]"));
        findElement(By.xpath("//*[@id='section_0']//*[contains(@class,'section_title')]//input")).clear();
        findElement(By.xpath("//*[@id='section_0']//*[contains(@class,'section_title')]//input")).sendKeys(newSectionName);
        clickElement(By.xpath("//*[@id='section_0']//*[contains(@class,'section_title')]//button[contains(text(),'Confirm')]"));
        textNotPresent("Confirm");
        textPresent(newSectionName, By.xpath("//*[@id='section_0']//*[contains(@class,'section_title')]"));

        String newSectionInstruction = "New Section Instruction";
        clickElement(By.xpath("//*[@id='section_0']//*[contains(@class,'section_instruction')]//i[contains(@class,'fa-edit')]"));
        textPresent("Plain Text");
        textPresent("Rich Text");
        textPresent("Confirm");
        findElement(By.xpath("//*[@id='section_0']//*[contains(@class,'section_instruction')]//textarea")).clear();
        findElement(By.xpath("//*[@id='section_0']//*[contains(@class,'section_instruction')]//textarea")).sendKeys(newSectionInstruction);
        clickElement(By.xpath("//*[@id='section_0']//*[contains(@class,'section_instruction')]//button[contains(text(),'Confirm')]"));
        textNotPresent("Confirm");
        textPresent(newSectionInstruction, By.xpath("//*[@id='section_0']//*[contains(@class,'section_instruction')]//div/span"));

        String newCardinality = "Exactly 1";
        new Select(findElement(By.xpath("//*[@id='section_0']//*[contains(@class,'section_cardinality')]/select"))).selectByVisibleText(newCardinality);
        saveEditQuestionSectionById("section_0");
        textNotPresent(newCardinality, By.xpath("//*[@id='section_0']//*[contains(@class,'section_cardinality')]"));
    }

    private void editQuestion() {
        scrollToViewById("question_0_0");
        startEditQuestionSectionById("question_0_0");
        clickElement(By.xpath("//*[@id='question_0_0']//i[contains(@class,'changeQuestionLabelIcon')]"));
        textPresent("Select a question label from a CDE Name");
        clickElement(By.xpath("//*[@id='q_select_name_1']/div/button"));

        String newQuestionInstruction = "New Question Instruction";
        clickElement(By.xpath("//*[@id='question_0_0']//*[contains(@class,'editQuestionInstructionIcon')]//i[contains(@class,'fa-edit')]"));
        textPresent("Plain Text");
        textPresent("Rich Text");
        textPresent("Confirm");
        findElement(By.xpath("//*[@id='question_0_0']//*[contains(@class,'editQuestionInstructionIcon')]//textarea")).clear();
        findElement(By.xpath("//*[@id='question_0_0']//*[contains(@class,'editQuestionInstructionIcon')]//textarea")).sendKeys(newQuestionInstruction);
        clickElement(By.xpath("//*[@id='question_0_0']//*[contains(@class,'editQuestionInstructionIcon')]//button[contains(text(),'Confirm')]"));
        textNotPresent("Confirm");

        String newQuestionUnitsOfMeasure = "New Units of Measure";
        clickElement(By.xpath("//*[@id='question_0_0']//*[contains(@class,'addUomBtn')]"));
        textPresent("Please specify");
        clickElement(By.xpath("//*[@id='q_uom_list_0']/span/span/i"));
        textPresent("Confirm");
        findElement(By.xpath("//*[@id='q_uom_list_0']/span/form/input")).clear();
        findElement(By.xpath("//*[@id='q_uom_list_0']/span/form/input")).sendKeys(newQuestionUnitsOfMeasure);
        clickElement(By.xpath("//*[@id='q_uom_list_0']/span/form/button[contains(text(),'Confirm')]"));
        textNotPresent("Confirm");

        saveEditQuestionSectionById("question_0_0");
        textPresent("Data unknown text", By.xpath("//*[@id='question_0_0']//*[contains(@class,'questionLabel')]"));
        textPresent(newQuestionUnitsOfMeasure, By.xpath("//*[@id='question_0_0']//*[contains(@class,'questionUom')]"));
        textPresent(newQuestionInstruction, By.xpath("//*[@id='question_0_0']//*[contains(@class,'questionInstruction')]"));

    }
}
