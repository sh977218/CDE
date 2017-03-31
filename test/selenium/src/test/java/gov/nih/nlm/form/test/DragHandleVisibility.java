package gov.nih.nlm.form.test;

import junit.framework.Assert;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class DragHandleVisibility extends BaseFormTest {

    @Test
    public void dragHandleVisibility() {
        mustBeLoggedOut();
        String formName = "Deployment Risk and Resiliency Inventory, Version 2 (Combat)";
        goToFormByName(formName);
        clickElement(By.id("description_tab"));
        assertNoElt(By.cssSelector("div.formSectionArea i.question-move-handle"));
        assertNoElt(By.cssSelector("i.section-move-handle"));
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName(formName);
        clickElement(By.linkText("Form Description"));
        Assert.assertTrue(findElement(By.xpath("//*[@id='section_0']//*[contains(@class,'section_view')]/div[contains(@class,'panel-heading')]//i[contains(@class,'fa fa-arrows')]")).isDisplayed());
        Assert.assertTrue(findElement(By.xpath("//*[@id='question_0_0']//*[contains(@class,'question_view')]/div[contains(@class,'panel-heading')]//i[contains(@class,'fa fa-arrows')]")).isDisplayed());
    }

}
