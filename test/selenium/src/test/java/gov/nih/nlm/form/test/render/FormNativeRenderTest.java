package gov.nih.nlm.form.test.render;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

public class FormNativeRenderTest extends NlmCdeBaseTest {

    private void checkForm() {
        textPresent("Outside section form: PROMIS SF v1.0 - Phys. Function 10a");
        textPresent("Inside section form: PROMIS SF v1.0 - Phys. Function 10a");
        textPresent("Are you able to get on and off the toilet?");
        findElement(By.xpath("//input[@name='q23' and @type='date']"));

        // question radio un-select
        WebElement input = findElement(By.xpath("//*[@id='Does your health now limit you in doing vigorous activities, " +
                "such as running, lifting heavy objects, participating in strenuous sports?_0']" +
                "//label[contains(.,'Not at all')]//input"));
        Assert.assertFalse(input.isSelected());
        input.click();
        Assert.assertTrue(input.isSelected());
        input.click();
        Assert.assertFalse(input.isSelected());

        input = findElement(By.xpath("//label[span[text()='Current Smoker']]//input"));
        Assert.assertFalse(input.isSelected());
        input.click();
        Assert.assertTrue(input.isSelected());
        input.click();
        Assert.assertFalse(input.isSelected());

        // single radio is checkbox if not required
        input = findElement(By.xpath("//*[@id='Cytosine adenine guanine repeat expansion result_0']" +
                "//label[span[text()='Not known']]//input[@type='checkbox']"));
        Assert.assertFalse(input.isSelected());
    }

    @Test
    public void nativeFormRenderTest() {
        loginAs(nlm_username, nlm_password);
        String formName = "Loinc Widget Test Form";
        goToFormByName(formName);
        checkForm();

        // required radio checked and no un-select
        goToFormDescription();
        startEditQuestionById("question_4_0");
        clickElement(By.xpath("//*[@id='question_4_0']//input[@title='Required']")); // make required
        hangon(2);
        goToPreview();
        WebElement label = findElement(By.xpath("//*[@id='Cytosine adenine guanine repeat expansion result_0']" +
                "//label[span[text()='Not known']]"));
        label.findElement(By.xpath("//input[@type='radio']"));
        Assert.assertEquals(label.findElements(By.cssSelector("input:checked")).size(), 1);
        label.findElement(By.cssSelector("input")).click();
        Assert.assertEquals(label.findElements(By.cssSelector("input:checked")).size(), 1);

        clickElement(By.id("selectRenderButton"));
        clickElement(By.id("button_print_follow"));
        switchTab(1);
        checkForm();
        switchTabAndClose(0);
    }
}
