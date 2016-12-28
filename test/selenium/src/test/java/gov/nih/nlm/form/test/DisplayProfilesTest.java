package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class DisplayProfilesTest extends BaseFormTest {

    private void createDisplayProfile(int index, String name, boolean matrix, boolean displayValues, boolean instructions, boolean numbering, String dispType, int numberOfColumns) {
        findElement(By.id("addDisplayProfile")).click();
        clickElement(By.xpath("//div[@id='profileNameEdit_" + index + "']//i[@title='Edit']"));
        findElement(By.xpath("//div[@id='profileNameEdit_" + index + "']//input[@type='text']")).clear();
        findElement(By.xpath("//div[@id='profileNameEdit_" + index + "']//input[@type='text']")).sendKeys(name);
        clickElement(By.xpath("//div[@id='profileNameEdit_" + index + "']//button[contains(@class, 'fa-check')]"));
        if (!matrix) clickElement(By.id("displayAsMatrix_" + index));
        if (displayValues) clickElement(By.id("displayValues_" + index));
        if (!instructions) clickElement(By.id("displayInstructions_" + index));
        if (!numbering) clickElement(By.id("displayNumbering_" + index));
        if (!"Follow-up".equals(dispType)) clickElement(By.id("displayType_" + index));
        clickElement(By.id("nc_" + index + "_" + numberOfColumns));
    }

    @Test
    public void displayProfiles() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName("PROMIS SF v1.1 - Anger 5a");
        textPresent("In the past 7 days");

        clickElement(By.partialLinkText("Display Profile:"));
        createDisplayProfile(0, "Matrix and Values", true, true, true, true, "Follow-up", 4);
        createDisplayProfile(1, "Matrix No Values", true, false, false, false, "Dynamic", 4);
        createDisplayProfile(2, "No Matrix No Values", false, false, false, false, "Dynamic", 5);
        saveForm();

        goToFormByName("PROMIS SF v1.1 - Anger 5a");
        textPresent("In the past 7 days");
        textPresent("Display Profile:");
        textPresent("1");
        textPresent("2");
        textPresent("3");
        textPresent("4");
        textPresent("5");
        Assert.assertEquals(driver.findElements(By.xpath("//table//input[@type='radio']")).size(), 25);
        assertNoElt(By.xpath("//select[@ng-model='question.question.answer']"));

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
        Assert.assertEquals(
                findElement(By.xpath("//div[div/div/label[text()='I was irritated more than people knew']]//label[text()='Never']")).getLocation().y,
                findElement(By.xpath("//div[div/div/label[text()='I was irritated more than people knew']]//label[text()='Always']")).getLocation().y
        );

        showAllTabs();
        clickElement(By.id("displayProfiles_tab"));

        for (int i = 0; i < 3; i++) {
            clickElement(By.id("removeDisplayProfile-0"));
            clickElement(By.id("confirmRemoveDisplayProfile-0"));
        }

        saveForm();
        clickElement(By.linkText("General Details"));
        textPresent("Display Profile:");
    }

}
