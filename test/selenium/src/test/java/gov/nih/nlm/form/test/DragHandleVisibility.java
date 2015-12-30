package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class DragHandleVisibility extends BaseFormTest {

    @Test
    public void dragHandleVisibility() {
        mustBeLoggedOut();
        String formName = "Deployment Risk and Resiliency Inventory, Version 2 (Combat)";
        goToFormByName(formName);
        findElement(By.linkText("Form Description")).click();
        Assert.assertEquals(findElement(By.cssSelector("div.formSectionArea"))
                .findElements(By.cssSelector("i.question-move-handle")).size(), 0);
        Assert.assertEquals(driver.findElements(By.cssSelector("i.section-move-handle")).size(), 0);
        mustBeLoggedInAs(ninds_username, password);
        findElement(By.linkText("Form Description")).click();
        findElement(By.xpath("(//*[@id=\"section_view_0\"]//div[contains(@class,'panel-body')]//div[contains(@class,'section-question-icon-div')]//i[contains(@class,'fa fa-arrows')])[1]"));
        findElement(By.xpath("//*[@id=\"section_view_0\"]/div[contains(@class,'panel-heading')]//div[contains(@class,'section-question-icon-div')]//i[contains(@class,'fa fa-arrows')]"));
    }

}
