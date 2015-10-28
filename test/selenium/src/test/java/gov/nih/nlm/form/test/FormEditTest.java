package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormEditTest extends BaseFormTest {

    QuestionTest questionTest = new QuestionTest();

    @Test
    public void formGetOutdated() {
        mustBeLoggedInAs(ctepCurator_username, password);

        String formName = "Form that gets outdated";
        String formDef = "Fill out carefully!";

        createForm(formName, formDef, null, "CTEP");
        new CreateEditSectionTest().addSection("Any Section Name", "0 or more");
        startAddingQuestions();

        questionTest.addQuestionToSection("Noncompliant Reason Text", 0);
        questionTest.addQuestionToSection("Cytogenetics Karyotype Mutation Abnormality Cell Count", 0);

        saveForm();

        textNotPresent("Some CDEs in this form have newer version");
        textNotPresent("(Outdated)");

        goToCdeByName("Cytogenetics Karyotype Mutation Abnormality Cell Count");
        findElement(By.cssSelector("i.fa-edit")).click();
        findElement(By.xpath("//div[@id='nameEdit']//input")).sendKeys("[name change number 1]");
        findElement(By.cssSelector(".fa-check")).click();
        newCdeVersion();

        goToFormByName(formName, "Incomplete");
        textPresent("Some CDEs in this form have newer version");
        findElement(By.linkText("Form Description")).click();
        textPresent("Cytogenetics Karyotype Mutation Abnormality Cell Count (Outdated)");
    }

    @Test
    public void editSectionAndQuestions() {
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName("History of Injury");
        textPresent("Timeframe of onset of NTSCI");
        findElement(By.linkText("Form Description")).click();
        textPresent("N/A");
        editSection();
        editQuestion();
        saveForm();
    }

    private void editSection() {
        String newSectionName = "New Main Section";
        findElement(By.xpath("//*[@id='section_title_0']/span/span/i")).click();
        textPresent("Confirm");
        findElement(By.xpath("//*[@id='section_title_0']/span/form/input")).clear();
        findElement(By.xpath("//*[@id='section_title_0']/span/form/input")).sendKeys(newSectionName);
        findElement(By.xpath("//*[@id='section_title_0']/span/form/button[1]")).click();
        textNotPresent("Confirm");
        textPresent(newSectionName, By.xpath("//*[@id='section_title_0']/span/span"));

        String newSectionInstruction = "New Section Instruction";
        findElement(By.xpath("//*[@id='dd_section_instructions_0']/div/span/span/i")).click();
        textPresent("Confirm");
        findElement(By.xpath("//*[@id='dd_section_instructions_0']/div/span/form/input")).clear();
        findElement(By.xpath("//*[@id='dd_section_instructions_0']/div/span/form/input")).sendKeys(newSectionInstruction);
        findElement(By.xpath("//*[@id='dd_section_instructions_0']/div/span/form/button[1]")).click();
        textNotPresent("Confirm");
        textPresent(newSectionInstruction, By.xpath("//*[@id='dd_section_instructions_0']/div/span/span"));

        String newCardinality = "Exactly 1";
        findElement(By.xpath("//*[@id='dd_card_0']/span[2]/i")).click();
        textPresent("Confirm");
        findElement(By.xpath("//*[@id='dd_card_0']/span/select")).click();
        textPresent("0 or 1");
        findElement(By.xpath("//*[@id='dd_card_0']/span/select/option[1]")).click();
        textPresent(newCardinality);
        findElement(By.xpath("//*[@id='dd_card_0']/span/button[1]")).click();
        textNotPresent("Confirm");
        textPresent(newCardinality, By.xpath("//*[@id='dd_card_0']/span[2]"));
    }

    private void editQuestion() {
        findElement(By.xpath("//*[@id='question_2']/div/div/div/div/div/h4/a")).click();
        textPresent("Value List");
        scrollTo(findElement(By.xpath("//*[@id='question_2']")).getLocation().getY());

        findElement(By.xpath("//*[@id='dd_question_title_2']/i")).click();
        textPresent("Select a question label from a CDE Name");
        findElement(By.xpath("//*[@id='q_select_name_1']/div/button")).click();
        textPresent("Data unknown text", By.xpath("//*[@id='dd_question_title_2']"));

        String newQuestionInstruction = "New Question Instruction";
        findElement(By.xpath("//*[@id='dd_question_instructions_2']/div/span/span/i")).click();
        textPresent("Confirm");
        findElement(By.xpath("//*[@id='dd_question_instructions_2']/div/span/form/input")).clear();
        findElement(By.xpath("//*[@id='dd_question_instructions_2']/div/span/form/input")).sendKeys(newQuestionInstruction);
        findElement(By.xpath("//*[@id='dd_question_instructions_2']/div/span/form/button[1]")).click();
        textNotPresent("Confirm");
        textPresent(newQuestionInstruction, By.xpath("//*[@id='dd_question_instructions_2']/div/span/span"));

        String newQuestionUnitsOfMeasure = "New Units of Measure";
        findElement(By.xpath("//*[@id='dd_q_uoms_2']/button")).click();
        textPresent("Please specify");
        findElement(By.xpath("//*[@id='q_uom_list_0']/span/span/i")).click();
        textPresent("Confirm");
        findElement(By.xpath("//*[@id='q_uom_list_0']/span/form/input")).clear();
        findElement(By.xpath("//*[@id='q_uom_list_0']/span/form/input")).sendKeys(newQuestionUnitsOfMeasure);
        findElement(By.xpath("//*[@id='q_uom_list_0']/span/form/button[1]")).click();
        textNotPresent("Confirm");
        textPresent(newQuestionUnitsOfMeasure, By.xpath("//*[@id='q_uom_list_0']/span/span"));

    }
}
