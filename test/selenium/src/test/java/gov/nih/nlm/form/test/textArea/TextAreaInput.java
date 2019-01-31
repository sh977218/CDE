package gov.nih.nlm.form.test.textArea;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class TextAreaInput extends NlmCdeBaseTest {

    @Test
    public void textAreaInput() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName("TextAreaForm");
        Assert.assertEquals(driver.findElements(By.cssSelector("textarea")).size(), 0);

        goToFormDescription();
        clickElement(By.cssSelector("span[title='Patient Name']"));
        clickElement(By.cssSelector("input[title='Show as Text Area']"));
        clickElement(By.cssSelector("span[title='Patient Name']"));

        clickElement(By.cssSelector("span[title='Noncompliant Reason Text']"));
        clickElement(By.cssSelector("input[title='Show as Text Area']"));
        clickElement(By.cssSelector("span[title='Noncompliant Reason Text']"));

        hangon(1);
        goToFormByName("TextAreaForm");
        Assert.assertEquals(driver.findElements(By.cssSelector("textarea")).size(), 5);

    }

}
