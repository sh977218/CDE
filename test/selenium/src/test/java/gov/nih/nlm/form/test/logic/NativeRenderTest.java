package gov.nih.nlm.form.test.logic;


import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class NativeRenderTest extends BaseFormTest {

    @Test
    public void oneLiner() {
        mustBeLoggedInAs(testEditor_username, password);
        String formName = "SDC Adrenal";
        goToFormByName(formName);

        Assert.assertEquals(
                findElement(By.xpath("//" + byValueListValueXPath("Not specified"))).getLocation().y,
                findElement(By.xpath("//" + byValueListValueXPath("Not specified") + "/following-sibling::div//input")).getLocation().y,
                8
        );

        clickElement(By.id("selectRenderButton"));
        clickElement(By.id("button_print_follow"));
        switchTab(1);
        textPresent("Does your health now limit you in climbing one flight of stairs?");
        switchTabAndClose(0);
    }

}