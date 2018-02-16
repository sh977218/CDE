package gov.nih.nlm.form.test.render;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

public class FormNativeRenderTest extends NlmCdeBaseTest {
    private void loincWidgetFormTests() {
        textPresent("Outside section form: PROMIS SF v1.0 - Phys. Function 10a");
        textPresent("Inside section form: PROMIS SF v1.0 - Phys. Function 10a");
        textPresent("Are you able to get on and off the toilet?");
        findElement(By.xpath("//input[@name='q23_date']/following-sibling::*//i[contains(@class, 'fa-calendar')]"));

        // question radio un-select
        WebElement label = findElement(By.xpath("//*[@id='Does your health now limit you in doing vigorous activities, such as running, lifting heavy objects, participating in strenuous sports?_0']//label[@title='Not at all']"));
        Assert.assertEquals(label.findElements(By.cssSelector("input:checked")).size(), 0);
        label.findElement(By.cssSelector("input")).click();
        Assert.assertEquals(label.findElements(By.cssSelector("input:checked")).size(), 1);
        label.findElement(By.cssSelector("input")).click();
        Assert.assertEquals(label.findElements(By.cssSelector("input:checked")).size(), 0);

        // table radio un-select
        label = findElement(By.xpath("//label[span[text()='Current Smoker']]"));
        Assert.assertEquals(label.findElements(By.cssSelector("input:checked")).size(), 0);
        label.findElement(By.cssSelector("input")).click();
        Assert.assertEquals(label.findElements(By.cssSelector("input:checked")).size(), 1);
        label.findElement(By.cssSelector("input")).click();
        Assert.assertEquals(label.findElements(By.cssSelector("input:checked")).size(), 0);

        // single radio is checkbox if not required
        label = findElement(By.xpath("//*[@id='Cytosine adenine guanine repeat expansion result_0']//label[span[text()='Not known']]"));
        label.findElement(By.xpath("//input[@type='checkbox']"));
        Assert.assertEquals(label.findElements(By.cssSelector("input:checked")).size(), 0);
    }

    @Test
    public void nativeFormRenderTest() {
        loginAs(nlm_username, nlm_password);
        String formName = "Loinc Widget Test Form";
        goToFormByName(formName);
        loincWidgetFormTests();

        // required radio checked and no un-select
        goToFormDescription();
        startEditQuestionById("question_4_0");
        clickElement(By.xpath("//*[@id='question_4_0']//input[@title='Required']")); // make required
        goToPreview();
        hangon(10);
        WebElement label = findElement(By.xpath("//*[@id='Cytosine adenine guanine repeat expansion result_0']//label[span[text()='Not known']]"));
        label.findElement(By.xpath("//input[@type='radio']"));
        Assert.assertEquals(label.findElements(By.cssSelector("input:checked")).size(), 1);
        label.findElement(By.cssSelector("input")).click();
        Assert.assertEquals(label.findElements(By.cssSelector("input:checked")).size(), 1);

        clickElement(By.id("selectRenderButton"));
        clickElement(By.id("button_print_follow"));
        switchTab(1);
        loincWidgetFormTests();
        switchTabAndClose(0);
    }
}
