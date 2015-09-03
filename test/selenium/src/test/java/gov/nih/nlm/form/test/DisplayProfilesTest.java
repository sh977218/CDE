package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class DisplayProfilesTest extends BaseFormTest {

    private void createDisplayProfile(int index, String name, boolean matrix, boolean displayValues) {
        findElement(By.id("addDisplayProfile")).click();
        findElement(By.xpath("//div[@id='profileNameEdit_" + index + "']//i[@title='Edit']")).click();
        findElement(By.xpath("//div[@id='profileNameEdit_" + index + "']//input[@type='text']")).clear();
        findElement(By.xpath("//div[@id='profileNameEdit_" + index + "']//input[@type='text']")).sendKeys(name);
        findElement(By.xpath("//div[@id='profileNameEdit_" + index + "']//button[contains(@class, 'fa-check')]")).click();
        if (matrix) findElement(By.id("displayAsMatrix_0")).click();
        if (displayValues) findElement(By.id("displayValues_0")).click();
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

        
    }

}
