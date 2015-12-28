package gov.nih.nlm.common.test;

import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.testng.Assert;
import org.testng.annotations.Test;

public class InlineEditTest extends BaseAttachmentTest {

    @Test
    public void CdeInlineEditTest() {
        String cdeName = "ImgTagTest";
        mustBeLoggedInAs(testAdmin_username, password);
        goToCdeByName(cdeName);
        String attachmentName = "nih-logo-color.png";
        addAttachment(attachmentName);
        reviewAttachment(attachmentName);
        mustBeLoggedInAs(testAdmin_username, password);
        goToCdeByName(cdeName);
        clickElement(By.id("attachments_tab"));
        clickElement(By.id("copyUrl_0"));
        clickElement(By.id("properties_tab"));
        clickElement(By.xpath("//*[@id='dd_prop_value_0']//i[contains(@class,'fa fa-edit')]"));
        textPresent("Rich Text");
        clickElement(By.xpath("//*[@id='dd_prop_value_0']//button[contains(text(),'Rich Text')]"));
        textPresent("Characters: 0");
        clickElement(By.xpath("//*[contains(@id,'taTextElement')]"));
        textPresent("Characters: 14");
        clickElement(By.xpath("//*[@id='dd_prop_value_0']/div/div/div[2]/div[2]/div[1]/div[4]/button[2]"));
        textPresent("Please enter an image URL to insert");
        Alert alert = driver.switchTo().alert();
        alert.sendKeys("www.google.com");
        clickElement(By.xpath("//*[@id='dd_prop_value_0']//button[contains(text(),'Confirm')]"));
        Alert errorAlert = driver.switchTo().alert();
        Assert.assertTrue(errorAlert.getText().contains("Error. Img src may only be a relative url starting with /data"));
        errorAlert.accept();
        findElement(By.xpath("//*[contains(@id,'taTextElement')]")).clear();
        textPresent("Characters: 0");
        clickElement(By.xpath("//*[@id='dd_prop_value_0']/div/div/div[2]/div[2]/div[1]/div[4]/button[2]"));
        alert = driver.switchTo().alert();
        alert.sendKeys(Keys.LEFT_CONTROL + "c");
        alert.accept();
        clickElement(By.xpath("//*[@id='dd_prop_value_0']//button[contains(text(),'Confirm')]"));
        Assert.assertTrue(findElement(By.xpath("//*[@id='dd_prop_value_0']//img/@src")).getText().contains("cde"));
    }
}
