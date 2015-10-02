package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
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

        findElement(By.id("input_otherPleaseSpecify")).click();
        new Select(findElement(By.id("triggeringValue_0"))).selectByValue("UNKNOWN");

        saveForm();
        scrollToTop();

        findElement(By.linkText("General Details")).click();
        textPresent("Patient Gender Category");

        Assert.assertTrue(driver.findElements(By.xpath("//input[@placeholder='Please Specify']")).size() == 0);

        new Select(findElement(By.cssSelector("select"))).selectByVisibleText("Unknown");
        findElement(By.xpath("//input[@placeholder='Please Specify']")).sendKeys("Transgender");

    }

}
