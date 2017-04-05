package gov.nih.nlm.form.test.logic;


import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class NativeRenderTest extends BaseFormTest {

    @Test
    public void oneLiner() {
        mustBeLoggedInAs(testAdmin_username, password);
        String formName = "SDC Adrenal";
        goToFormByName(formName);

        Assert.assertEquals(
                findElement(By.xpath("//label[text()='Not specified']")).getLocation().y,
                findElement(By.xpath("//label[text()='Not specified']/following-sibling::div//input")).getLocation().y,
                8
        );
    }

}