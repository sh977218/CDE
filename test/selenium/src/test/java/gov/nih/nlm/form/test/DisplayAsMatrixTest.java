package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class DisplayAsMatrixTest extends BaseFormTest {

    @Test
    public void displayAsMatrix() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormSearch();
        findElement(By.id("browseOrg-PROMIS / Neuro-QOL")).click();
        findElement(By.id("li-blank-Neuro-QOL Measures")).click();
        findElement(By.id("li-blank-Adult Short Forms")).click();
        findElement(By.partialLinkText("Neuro-QOL SF v1.0 - Fatigue")).click();
        findElement(By.xpath("//a[@title='Full Detail for Neuro-QOL SF v1.0 - Fatigue']")).click();
        textPresent("I felt exhausted");
        Assert.assertEquals(driver.findElements(By.xpath("//table//input[@type='radio']")).size(), 0);
        Assert.assertEquals(driver.findElements(By.xpath("//select[@ng-model='question.question.answer']")).size(), 8);
        findElement(By.linkText("Form Description")).click();

        // because question "I felt tired has different list, no display as matrix is shown
        textNotPresent("Display as Matrix");
        clickElement(By.id("remove_q_6"));
        textPresent("Display as Matrix");
        findElement(By.id("displayAsMatrix_0")).click();
        saveForm();
        goToFormByName("Neuro-QOL SF v1.0 - Fatigue");
        textPresent("I felt exhausted");
        Assert.assertEquals(driver.findElements(By.xpath("//table//input[@type='radio']")).size(), 35);
        Assert.assertEquals(driver.findElements(By.xpath("//select[@ng-model='question.question.answer']")).size(), 0);
    }

}
