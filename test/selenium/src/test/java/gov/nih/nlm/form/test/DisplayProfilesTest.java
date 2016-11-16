package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class DisplayProfilesTest extends BaseFormTest {

    private void createDisplayProfile(int index, String name, boolean matrix, boolean displayValues) {
        findElement(By.id("addDisplayProfile")).click();
        clickElement(By.xpath("//div[@id='profileNameEdit_" + index + "']//i[@title='Edit']"));
        findElement(By.xpath("//div[@id='profileNameEdit_" + index + "']//input[@type='text']")).clear();
        findElement(By.xpath("//div[@id='profileNameEdit_" + index + "']//input[@type='text']")).sendKeys(name);
        clickElement(By.xpath("//div[@id='profileNameEdit_" + index + "']//button[contains(@class, 'fa-check')]"));
        if (matrix) clickElement(By.id("displayAsMatrix_" + index));
        if (displayValues) clickElement(By.id("displayValues_" + index));
    }

    @Test(priority = -1)
    public void displayProfiles() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName("PROMIS SF v1.1 - Anger 5a");
        textPresent("In the past 7 days");
        textNotPresent("Display Profile:");
        showAllTabs();
        clickElement(By.id("displayProfiles_tab"));

        createDisplayProfile(0, "Matrix and Values", true, true);
        createDisplayProfile(1, "Matrix No Values", true, false);
        createDisplayProfile(2, "No Matrix No Values", false, false);

        saveForm();

        goToFormByName("PROMIS SF v1.1 - Anger 5a");
        clickElement(By.linkText("native"));
        textPresent("In the past 7 days");
        textPresent("Display Profile:");

        Assert.assertEquals(driver.findElements(By.xpath("//table//input[@type='radio']")).size(), 25);
        assertNoElt(By.xpath("//select[@ng-model='question.question.answer']"));
        textPresent("1");
        textPresent("2");
        textPresent("3");
        textPresent("4");
        textPresent("5");

        new Select(driver.findElement(By.id("select_display_profile"))).selectByVisibleText("Matrix No Values");
        hangon(1);
        Assert.assertEquals(driver.findElements(By.xpath("//table//input[@type='radio']")).size(), 25);
        assertNoElt(By.xpath("//select[@ng-model='question.question.answer']"));

        new Select(driver.findElement(By.id("select_display_profile"))).selectByVisibleText("No Matrix No Values");
        hangon(1);
        assertNoElt(By.xpath("//table//input[@type='radio']"));
        assertNoElt(By.xpath("//select[@ng-model='question.question.answer']"));
        textPresent("1");
        textPresent("2");
        textPresent("3");
        textPresent("4");
        textPresent("5");

        showAllTabs();
        clickElement(By.id("displayProfiles_tab"));

        for (int i = 0; i < 3; i++) {
            clickElement(By.id("removeDisplayProfile-0"));
            clickElement(By.id("confirmRemoveDisplayProfile-0"));
        }

        saveForm();
        clickElement(By.linkText("General Details"));
        textNotPresent("Display Profile:");
    }

}
