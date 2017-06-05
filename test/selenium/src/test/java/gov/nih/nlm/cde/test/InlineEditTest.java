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


        // probably an issue with the clamAv mock. So we try twice.
        try {
            addAttachment(attachmentName);
            textPresent(attachmentName + " - This attachment cannot");
        } catch (Exception e) {
            goToCdeByName(cdeName);

            addAttachment(attachmentName);
            textPresent(attachmentName + " - This attachment cannot");
        }
        // wait before checking inbox
        hangon(5);
        reviewAttachment(attachmentName);
        mustBeLoggedInAs(testAdmin_username, password);
        goToCdeByName(cdeName);

        clickElement(By.id("attachments_tab"));
        String url = findElement(By.id("attachment_file_url_0")).getAttribute("href");
        clickElement(By.id("properties_tab"));
        clickElement(By.xpath("//*[@id='value_0']//i[contains(@class,'fa fa-edit')]"));
        textPresent("Rich Text");
        clickElement(By.xpath("//*[@id='value_0']//button[contains(text(),'Rich Text')]"));

        clickElement(By.cssSelector(".cke_button__image"));
        findElement(By.id("cke_181_textInput")).sendKeys("www.google.com");
        clickElement(By.linkText("OK"));
        clickElement(By.xpath("//*[@id='value_0']//button[contains(text(),'Confirm')]"));

        shortWait.until(ExpectedConditions.alertIsPresent());
        Alert errorAlert = driver.switchTo().alert();
        Assert.assertTrue(errorAlert.getText().contains("Error. Img src may only be a relative url starting with /data"));
        errorAlert.accept();
        clickElement(By.cssSelector("button.fa-times"));

        clickElement(By.xpath("//*[@id='value_0']//i[contains(@class,'fa fa-edit')]"));
        textPresent("Rich Text");
        clickElement(By.xpath("//*[@id='value_0']//button[contains(text(),'Rich Text')]"));
        clickElement(By.cssSelector(".cke_button__source"));
        findElement(By.cssSelector("textarea.cke_source")).sendKeys("validate image url");
        textPresent("validate image url");
        clickElement(By.cssSelector(".cke_button__source"));
        clickElement(By.cssSelector(".cke_button__image"));
        findElement(By.id("cke_181_textInput")).sendKeys(url);
        clickElement(By.linkText("OK"));

        clickElement(By.cssSelector("button.fa-check"));

        textPresent("Saved");
        closeAlert();
        Assert.assertTrue(findElement(By.xpath("//*[@id='value_0']//img")).getAttribute("src").contains("cde"));
    }
}
