package gov.nih.nlm.form.test.textArea;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class TextAreaInput extends NlmCdeBaseTest {

    @Test
    public void textAreaInput() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName("TextAreaForm");
        Assert.assertEquals(driver.findElements(By.xpath("//*[@id='preview-div']//textarea")).size(), 0);

        goToFormDescription();
        String textAreaInput = " input[title='Show as Text Area']";
        String q0 = "#question_0-0";
        clickElement(By.cssSelector(q0 + " span[title='Patient Name']"));
        clickElement(By.cssSelector(q0 + textAreaInput));
        Assert.assertEquals(driver.findElements(By.cssSelector(q0 + textAreaInput + cssInputCheckboxChecked)).size(), 1);
        clickElement(By.cssSelector(q0 + " span[title='Patient Name']"));


        String q11 = "#question_0-1-1";
        clickElement(By.cssSelector(q11 + " span[title='Noncompliant Reason Text']"));
        closeAlert();
        clickElement(By.cssSelector(q11 + textAreaInput));
        closeAlert();
        Assert.assertEquals(driver.findElements(By.cssSelector(q11 + textAreaInput + cssInputCheckboxChecked)).size(), 1);
        clickElement(By.cssSelector(q11 + " span[title='Noncompliant Reason Text']"));

        saveFormEdit();
        Assert.assertEquals(driver.findElements(By.xpath("//*[@id='preview-div']//textarea")).size(), 5);
    }

}
