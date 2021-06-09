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
        String attachmentName = "nih-logo-color.png";

        mustBeLoggedInAs(nlmCuratorUser_username, password);
        goToCdeByName(cdeName);
        goToAttachments();
        addAttachment(attachmentName);
        hangon(5);

        logout();
        mustBeLoggedInAs(testEditor_username, password);
        goToCdeByName(cdeName);

        goToAttachments();
        String url = findElement(By.id("attachment_file_url_0")).getAttribute("href");
        goToProperties();
        clickElement(By.xpath("//*[@itemprop='value_0']//mat-icon[normalize-space() = 'edit']"));
        textPresent("Rich Text");
        clickElement(By.xpath("//*[@itemprop='value_0']//button[. = 'Rich Text']"));

        hangon(2);

        clickElement(By.cssSelector(".cke_button__image"));
        findElement(By.xpath("//div[label[. = 'URL']]//input")).sendKeys("www.google.com");
        clickElement(By.linkText("OK"));
        clickElement(By.xpath("//*[@itemprop='value_0']//button[contains(text(),'Confirm')]"));

        shortWait.until(ExpectedConditions.alertIsPresent());
        Alert errorAlert = driver.switchTo().alert();
        Assert.assertTrue(errorAlert.getText().contains("Error. Img src may only be a relative url starting with /data"));
        errorAlert.accept();
        clickElement(By.xpath("//button/mat-icon[normalize-space() = 'cancel']"));

        clickElement(By.xpath("//*[@itemprop='value_0']//mat-icon[normalize-space() = 'edit']"));
        textPresent("Rich Text");
        clickElement(By.xpath("//*[@itemprop='value_0']//button[. = 'Rich Text']"));
        clickElement(By.cssSelector(".cke_button__source"));
        findElement(By.cssSelector("textarea.cke_source")).sendKeys("validate image url");
        clickElement(By.cssSelector(".cke_button__source"));
        clickElement(By.cssSelector(".cke_button__image"));
        findElement(By.xpath("//div[label[. = 'URL']]//input")).sendKeys(url);
        clickElement(By.linkText("OK"));

        clickElement(By.xpath("//button//mat-icon[normalize-space() = 'check']"));
        textPresent("validate image url");
        Assert.assertTrue(findElement(By.xpath("//*[@itemprop='value_0']//img")).getAttribute("src").contains("cde"));
    }
}
