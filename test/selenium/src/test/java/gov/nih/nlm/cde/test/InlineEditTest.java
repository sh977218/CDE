package gov.nih.nlm.cde.test;

import gov.nih.nlm.common.test.BaseAttachmentTest;
import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class InlineEditTest extends BaseAttachmentTest {

    @Test
    public void cdeInlineEditTest() {
        String cdeName = "ImgTagTest";
        mustBeLoggedInAs(testAdmin_username, password);
        goToCdeByName(cdeName);
        String attachmentName = "nih-logo-color.png";
        showAllTabs();
        addAttachment(attachmentName);

        reviewAttachment(attachmentName);
        mustBeLoggedInAs(testAdmin_username, password);
        goToCdeByName(cdeName);
        clickElement(By.id("attachments_tab"));
        String url = findElement(By.id("attachment_file_url_0")).getAttribute("href");
        clickElement(By.id("properties_tab"));
        clickElement(By.xpath("//*[@id='dd_prop_value_0']//i[contains(@class,'fa fa-edit')]"));
        textPresent("Rich Text");
        clickElement(By.xpath("//*[@id='dd_prop_value_0']//button[contains(text(),'Rich Text')]"));
        hangon(2);
        clickElement(By.xpath("//div[contains(@id,'taTextElement')]"));
        hangon(2);
        clickElement(By.cssSelector(".fa-picture-o"));
        shortWait.until(ExpectedConditions.alertIsPresent());
        Alert alert = driver.switchTo().alert();
        alert.sendKeys("www.google.com");
        alert.accept();
        clickElement(By.xpath("//*[@id='dd_prop_value_0']//button[contains(text(),'Confirm')]"));
        shortWait.until(ExpectedConditions.alertIsPresent());
        Alert errorAlert = driver.switchTo().alert();
        Assert.assertTrue(errorAlert.getText().contains("Error. Img src may only be a relative url starting with /data"));
        errorAlert.accept();
        findElement(By.xpath("//*[contains(@id,'taTextElement')]")).clear();
        findElement(By.xpath("//*[contains(@id,'taTextElement')]")).sendKeys("validate image url");
        textPresent("validate image url");
        clickElement(By.cssSelector(".fa-picture-o"));
        shortWait.until(ExpectedConditions.alertIsPresent());
        alert = driver.switchTo().alert();
        alert.sendKeys(url);
        alert.accept();
        clickElement(By.xpath("//*[@id='dd_prop_value_0']//button[contains(text(),'Confirm')]"));
        hangon(1);
        Assert.assertTrue(findElement(By.xpath("//*[@id='dd_prop_value_0']//img")).getAttribute("src").contains("cde"));
    }
}
