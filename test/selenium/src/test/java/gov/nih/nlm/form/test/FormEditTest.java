package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class FormEditTest extends BaseFormTest {

    @Test
    public void formGetOutdated() {
        mustBeLoggedInAs(test_username, password);
        String formName = "Form that gets outdated";
        goToFormByName(formName);
        textPresent("Some CDEs in this form have newer version");
        clickElement(By.id("description_tab"));
        textPresent("Cytogenetics Karyotype Mutation Abnormality Cell Count\n" +
                "   (Outdated)");
    }

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
        clickElement(By.xpath("//*[@id='section_title_0']/span/span/i"));
        textPresent("Confirm");
        findElement(By.xpath("//*[@id='section_title_0']/span/form/input")).clear();
        findElement(By.xpath("//*[@id='section_title_0']/span/form/input")).sendKeys(newSectionName);
        clickElement(By.xpath("//*[@id='section_title_0']/span/form/button[1]"));
        textNotPresent("Confirm");
        textPresent(newSectionName, By.xpath("//*[@id='section_title_0']/span/span"));

        String newSectionInstruction = "New Section Instruction";
        clickElement(By.xpath("//*[@id='dd_section_instructions_0']//i"));
        textPresent("Plain Text");
        textPresent("Rich Text");
        textPresent("Confirm");
        findElement(By.xpath("//*[@id='dd_section_instructions_0']//textarea")).clear();
        findElement(By.xpath("//*[@id='dd_section_instructions_0']//textarea")).sendKeys(newSectionInstruction);
        clickElement(By.xpath("//*[@id='dd_section_instructions_0']//button[contains(text(),'Confirm')]"));
        textNotPresent("Confirm");
        textPresent(newSectionInstruction, By.xpath("//*[@id='dd_section_instructions_0']/div/div/div/span"));

        String newCardinality = "Exactly 1";
        clickElement(By.xpath("//*[@id='dd_card_0']//i"));
        textPresent("Confirm");
        new Select(findElement(By.xpath("//select[@id='select_section_card_0']"))).selectByVisibleText(newCardinality);
        textPresent(newCardinality);
        clickElement(By.xpath("//*[@id='dd_card_0']//button[1]"));
        textNotPresent("Confirm");
        textPresent(newCardinality, By.xpath("//*[@id='dd_card_0']/div[2]"));
    }

    private void editQuestion() {
        clickElement(By.xpath("//*[@id='question_0']//h4"));
        textPresent("Value List");
        scrollTo(findElement(By.xpath("//*[@id='question_0']")).getLocation().getY());

        clickElement(By.xpath("//*[@id='dd_question_title_0']/i"));
        textPresent("Select a question label from a CDE Name");
        clickElement(By.xpath("//*[@id='q_select_name_1']/div/button"));
        textPresent("Data unknown text", By.xpath("//*[@id='dd_question_title_0']"));

        String newQuestionInstruction = "New Question Instruction";
        clickElement(By.xpath("//*[@id='dd_question_instructions_0']//i"));
        textPresent("Plain Text");
        textPresent("Rich Text");
        textPresent("Confirm");
        findElement(By.xpath("//*[@id='dd_question_instructions_0']//textarea")).clear();
        findElement(By.xpath("//*[@id='dd_question_instructions_0']//textarea")).sendKeys(newQuestionInstruction);
        clickElement(By.xpath("//*[@id='dd_question_instructions_0']//button[contains(text(),'Confirm')]"));
        textNotPresent("Confirm");
        textPresent(newQuestionInstruction, By.xpath("//*[@id='dd_question_instructions_0']/div/div/div/span/span"));

        String newQuestionUnitsOfMeasure = "New Units of Measure";
        clickElement(By.xpath("//*[@id='dd_q_uoms_0']/button"));
        textPresent("Please specify");
        clickElement(By.xpath("//*[@id='q_uom_list_0']/span/span/i"));
        textPresent("Confirm");
        findElement(By.xpath("//*[@id='q_uom_list_0']/span/form/input")).clear();
        findElement(By.xpath("//*[@id='q_uom_list_0']/span/form/input")).sendKeys(newQuestionUnitsOfMeasure);
        clickElement(By.xpath("//*[@id='q_uom_list_0']/span/form/button[1]"));
        textNotPresent("Confirm");
        textPresent(newQuestionUnitsOfMeasure, By.xpath("//*[@id='q_uom_list_0']/span/span"));

    }
}
