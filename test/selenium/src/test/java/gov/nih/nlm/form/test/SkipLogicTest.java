package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class SkipLogicTest extends BaseFormTest {

    QuestionTest questionTest = new QuestionTest();
    CreateEditSectionTest sectionTest = new CreateEditSectionTest();

    @Test
    public void singlePermissibleValue() {
        mustBeLoggedInAs(ctepCurator_username, password);
        maxWindow();
        String formName = "Cancer Screening Test";
        String formDef = "General Cancer Screening Test!";
        String formV = "0.1";
        createForm(formName, formDef, formV, "CTEP");
        findElement(By.linkText("Form Description")).click();
        sectionTest.addSection("Patient Demographics", "0 or more");
        sectionTest.addSection("Female Patient Screening", "0 or more");
        startAddingQuestions();

        questionTest.addQuestionToSection("Frontal Systems Behavior Scale (FrSBE) - Disinhibition subscale T score", 0);
        questionTest.addQuestionToSection("Patient Gender Category", 0);
        questionTest.addQuestionToSection("Breast Carcinoma Estrogen Receptor Status", 1);

        clickElement(By.id("question_accordion_0_1"));
        textPresent("Female Gender");
        findElement(By.xpath("//*[@id='dd_q_skipLogic_1']/input")).sendKeys("\"Frontal Systems Behavior Scale (FrSBE) - Disinhibition subscale T score\" = 200");
        findElement(By.xpath("//*[@id='dd_s_skipLogic_1']/input")).sendKeys("\"Patient Gender Category\" = \"FEMALE\"");

        questionTest.addSectionToSection(1, 0);
        saveForm();

        goToFormByName(formName);
        clickElement(By.linkText("native"));
        textNotPresent("Female Patient Screening");
        textNotPresent("Breast Carcinoma Estrogen Receptor Status");
        findElement(By.xpath("//div[label[text()='Frontal Systems Behavior Scale (FrSBE) - Disinhibition subscale T score']]/following-sibling::div//input")).sendKeys("200");
        textPresent("Patient Gender Category");
        new Select(findElement(By.xpath("//div[label[text()='Patient Gender Category']]/following-sibling::div//select")))
                .selectByVisibleText("Female Gender");
        textPresent("Female Patient Screening");
    }

}
