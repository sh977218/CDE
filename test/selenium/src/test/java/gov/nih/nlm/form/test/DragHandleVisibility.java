package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class DragHandleVisibility extends BaseFormTest {

    @Test
    public void dragHandleVisibility() {
        mustBeLoggedOut();
        goToFormByName("Intraoperative Management");
        findElement(By.linkText("Form Description")).click();
        Assert.assertEquals(findElement(By.cssSelector("div.formSectionArea")).findElements(By.cssSelector("i.question-move-handle")).size(), 0);
        Assert.assertEquals(driver.findElements(By.cssSelector("i.section-move-handle")).size(), 0);

        mustBeLoggedInAs(ninds_username, password);
        goToFormByName("Intraoperative Management");
        findElement(By.linkText("Form Description")).click();
        findElement(By.cssSelector("div.formSectionArea")).findElement(By.cssSelector("i.question-move-handle"));
        findElement(By.cssSelector("div.formSectionArea")).findElement(By.cssSelector("i.section-move-handle"));
    }

}
