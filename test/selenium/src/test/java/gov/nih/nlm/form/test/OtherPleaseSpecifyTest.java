package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class OtherPleaseSpecifyTest extends BaseFormTest {

    private QuestionTest questionTest = new QuestionTest();

    @Test
    public void otherPleaseSpecify() {
        mustBeLoggedInAs(ctepCurator_username, password);
        String formName = "Other Please Specify Test";
        String formDef = "Form to test other please specify";

        createForm(formName, formDef, null, "CTEP");

        findElement(By.linkText("Form Description")).click();

        new CreateEditSectionTest().addSection("Basic Section", null);

        startAddingQuestions();
        questionTest.addQuestionToSection("Patient Gender Category", 0);

        scrollToTop();
        findElement(By.id("question_accordion_0_0")).click();
        hangon(1);

        // Remove Unknown
        findElement(By.xpath("//div[@id='question_0']//ul[@class='select2-choices']//li[1]/a")).click();

        findElement(By.id("input_otherPleaseSpecify")).click();

        saveForm();
        scrollToTop();

        findElement(By.id("formLocalPreview")).click();
        switchTab(1);
        textPresent("Patient Gender Category");

        new Select(findElement(By.cssSelector("select"))).selectByValue("otherPleaseSpecify");
        findElement(By.xpath("//input[@placeholder='Please Specify']")).sendKeys("Transgender");

        switchTabAndClose(0);
    }

}
