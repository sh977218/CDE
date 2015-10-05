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
        resizeWindow(1524, 1150);
        String formName = "Cancer Screening Test";
        String formDef = "General Cancer Screening Test!";
        String formV = "0.1";
        createForm(formName, formDef, formV, "CTEP");
        findElement(By.linkText("Form Description")).click();
        sectionTest.addSection("Patient Demographics", "0 or more");
        sectionTest.addSection("Female Patient Screening", "0 or more");
        startAddingQuestions();

        questionTest.addQuestionToSection("Patient Gender Category", 0);
        questionTest.addQuestionToSection("Person Birth Date", 0);
        questionTest.addQuestionToSection("Breast Carcinoma Estrogen Receptor Status", 1);
        findElement(By.xpath("//*[@id='section_view_1']/div[1]/div/div/dl/span[1]/dd/input"))
                .sendKeys("\"Patient Gender Category\" = \"Female Gender\"");

        questionTest.addSectionToSection(1, 0);
        saveForm();

        goToFormByName(formName);
        textNotPresent("Female Patient Screening");
        new Select(findElement(By.xpath("//div[label[text()=\"Patient Gender Category\"]]/following-sibling::div//select")))
                .selectByVisibleText("Female Gender");
        textPresent("Female Patient Screening");
    }

}
