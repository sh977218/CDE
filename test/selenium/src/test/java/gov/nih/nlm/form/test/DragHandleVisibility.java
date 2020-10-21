package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class DragHandleVisibility extends BaseFormTest {

    @Test
    public void dragHandleVisibility() {
        String formName = "Deployment Risk and Resiliency Inventory, Version 2 (Combat)";
        goToFormByName(formName);
        formEditNotAvailable();
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName(formName);
        goToFormDescription();
        Assert.assertTrue(findElement(By.xpath("//*[@id='section_0']//div[contains(@class,'sectionTitle')]//mat-icon[normalize-space() = 'drag_handle']")).isDisplayed());
        Assert.assertTrue(findElement(By.xpath("//*[@id = 'question_0-0']//mat-icon[normalize-space() = 'drag_handle']")).isDisplayed());
    }

}
