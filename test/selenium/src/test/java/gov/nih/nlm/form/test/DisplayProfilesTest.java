package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class DisplayProfilesTest extends BaseFormTest {

    private void createDisplayProfile(int index, String name, boolean matrix, boolean displayValues) {
        findElement(By.id("addDisplayProfile")).click();
        findElement(By.xpath("//div[@id='profileNameEdit_" + index + "']//i[@title='Edit']")).click();
        findElement(By.xpath("//div[@id='profileNameEdit_" + index + "']//input[@type='text']")).clear();
        findElement(By.xpath("//div[@id='profileNameEdit_" + index + "']//input[@type='text']")).sendKeys(name);
        findElement(By.xpath("//div[@id='profileNameEdit_" + index + "']//button[contains(@class, 'fa-check')]")).click();
        if (matrix) findElement(By.id("displayAsMatrix_" + index)).click();
        if (displayValues) findElement(By.id("displayValues_" + index)).click();
    }

    @Test
    public void displayProfiles() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName("PROMIS SF v1.1 - Anger 5a");
        textPresent("In the past 7 days");
        textNotPresent("Display Profile:");
        findElement(By.linkText("Display Profiles")).click();

        createDisplayProfile(0, "Matrix and Values", true, true);
        createDisplayProfile(1, "Matrix No Values", true, false);
        createDisplayProfile(2, "No Matrix No Values", false, false);

        saveForm();

        goToFormByName("PROMIS SF v1.1 - Anger 5a");
        textPresent("In the past 7 days");
        textPresent("Display Profile:");

        Assert.assertEquals(driver.findElements(By.xpath("//table//input[@type='radio']")).size(), 25);
        Assert.assertEquals(driver.findElements(By.xpath("//select[@ng-model='question.question.answer']")).size(), 0);
        textPresent("1");textPresent("2");textPresent("3");textPresent("4");textPresent("5");

        new Select(driver.findElement(By.id("select_display_profile"))).selectByVisibleText("Matrix No Values");
        hangon(1);
        Assert.assertEquals(driver.findElements(By.xpath("//table//input[@type='radio']")).size(), 25);
        Assert.assertEquals(driver.findElements(By.xpath("//select[@ng-model='question.question.answer']")).size(), 0);

        new Select(driver.findElement(By.id("select_display_profile"))).selectByVisibleText("No Matrix No Values");
        hangon(1);
        Assert.assertEquals(driver.findElements(By.xpath("//table//input[@type='radio']")).size(), 0);
        Assert.assertEquals(driver.findElements(By.xpath("//select[@ng-model='question.question.answer']")).size(), 5);

        findElement(By.linkText("Display Profiles")).click();

        for (int i =0; i < 3; i++) {
            findElement(By.id("removeDisplayProfile-0")).click();
            findElement(By.id("confirmRemoveDisplayProfile-0")).click();
        }

        saveForm();
        findElement(By.linkText("General Details")).click();
        textNotPresent("Display Profile:");

    }

}
