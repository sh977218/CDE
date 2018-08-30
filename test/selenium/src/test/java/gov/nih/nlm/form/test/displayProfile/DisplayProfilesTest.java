package gov.nih.nlm.form.test.displayProfile;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class DisplayProfilesTest extends BaseFormTest {
    @Test
    public void displayProfiles() {
        String formName = "PROMIS SF v1.1 - Anger 5a";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        goToFormDescription();

        clickElement(By.id("displayProfiles_tab"));
        createDisplayProfile(0, "Matrix and Values", true, true, true, true, "Follow-up", 1, false, 0);
        createDisplayProfile(1, "Matrix No Values", true, false, false, false, "Dynamic", 6, true, 0);
        createDisplayProfile(2, "No Matrix No Values", false, false, false, false, "Follow-up", 1, false, 0);
        clickElement(By.id("displayMetadataDevice_2"));
        createDisplayProfile(3, "No Matrix No Values Wider", false, false, false, false, "Follow-up", 5, false, 0);
        createDisplayProfile(4, "Multiple Select", false, false, false, false, "Dynamic", 5, false, 4);
        scrollToTop();
        Assert.assertEquals(driver.findElements(By.xpath("//*[@id='profile_0']//table//input[@type='radio']")).size(), 10);

        // because of zoom 60%, use driver.findElement because zoom 60% makes element not visible
        Assert.assertEquals(
                driver.findElement(By.xpath("(//*[@id='profile_0']//*[contains(@class,'native-section')]//table//input[@type='radio'])[5]/../span")).getText(), "1");
        scrollToViewById("profile_3");
        String baseXpath = "//*[@id='profile_3']//*[contains(@class,'displayProfileRenderDiv')]//*[*[normalize-space()='Education level USA type']]//";

        int i = 5;
        while (i >= 0) {
            if (i == 0) Assert.fail("Unexpected y value");
            if (findElement(By.xpath(baseXpath + byValueListValueXPath("1st Grade"))).getLocation().y !=
                    findElement(By.xpath(baseXpath + byValueListValueXPath("5th Grade"))).getLocation().y) {
                hangon(1);
                i--;
                hangon(1);
            } else i = -1;
        }
        newFormVersion();

        goToFormByName(formName);
        textPresent("In the past 7 days");
        Assert.assertEquals(driver.findElements(By.cssSelector(".fa.fa-plus.iconButton")).size(), 0);
        textPresent("I felt annoyed");
        textPresent("1", By.xpath("//*[@id='formRenderSection_In the past 7 days']//table/tbody/tr[1]/td[2]"));
        textPresent("5", By.xpath("//*[@id='formRenderSection_In the past 7 days']//table/tbody/tr[1]/td[6]"));
        Assert.assertEquals(driver.findElements(By.xpath("//div[@id='formRenderSection_In the past 7 days']//table//input[@type='radio']")).size(), 25);
        assertNoElt(By.xpath("//select[@ng-model='question.question.answer']"));
        textNotPresent("I was grouchy");

        selectDisplayProfileByName("Matrix No Values");
        hangon(1);
        Assert.assertEquals(driver.findElements(By.xpath("//div[@id='formRenderSection_In the past 7 days']//table//input[@type='radio']")).size(), 25);
        assertNoElt(By.xpath("//select[@ng-model='question.question.answer']"));
        textNotPresent("1", By.xpath("//table"));
        textPresent("I was grouchy");

        selectDisplayProfileByName("No Matrix No Values");
        hangon(1);
        assertNoElt(By.xpath("//div[@id='formRenderSection_In the past 7 days']//table//input[@type='radio']"));
        assertNoElt(By.xpath("//select[@ng-model='question.question.answer']"));
        Assert.assertTrue(findElement(By.xpath("//div[@id='I was irritated more than people knew_0-0']//" + byValueListValueXPath("Never"))).getLocation().y + 8 <
                findElement(By.xpath("//div[@id='I was irritated more than people knew_0-0']//" + byValueListValueXPath("Rarely"))).getLocation().y
        );
        clickElement(By.cssSelector(".fa.fa-plus.iconButton"));
        clickElement(By.xpath("//a[text()='Add Device by UDI']"));
        findElement(By.xpath("//input[@id='deviceSearchInput']")).clear();
        findElement(By.xpath("//input[@id='deviceSearchInput']")).sendKeys("=/08717648200274=,000025=A99971312345600=>014032=}013032&,1000000000000XYZ123");
        clickElement(By.cssSelector("section.metadata-item button"));
        textPresent("Device DI:");
        textPresent("08717648200274");
        textPresent("ICCBBA");
        textPresent("XIENCE ALPINE");

        selectDisplayProfileByName("No Matrix No Values Wider");

        baseXpath = "//*[*[normalize-space()='I was irritated more than people knew']]//";
        i = 5;
        while (i >= 0) {
            if (i == 0) Assert.fail("Unexpected y value");
            if (findElement(By.xpath(baseXpath + byValueListValueXPath("Never"))).getLocation().y !=
                    findElement(By.xpath(baseXpath + byValueListValueXPath("Always"))).getLocation().y) {
                hangon(1);
                i--;
            } else i = -1;
        }

        selectDisplayProfileByName("Multiple Select");
        hangon(1);
        new Select(findElement(By.xpath("//div[@id='I was irritated more than people knew_0-0']//select"))).selectByVisibleText("Never");
        new Select(findElement(By.xpath("//div[@id='I was irritated more than people knew_0-0']//select"))).selectByVisibleText("Rarely");
        new Select(findElement(By.xpath("//div[@id='I was irritated more than people knew_0-0']//select"))).selectByVisibleText("Often");
        new Select(findElement(By.xpath("//div[@id='I felt angry_0-1']//select"))).selectByVisibleText("Sometimes");
        Assert.assertEquals(driver.findElements(By.xpath("//div[@id='Adverse Event Ongoing Event Indicator_1-0']//div//input[@type='radio']")).size(), 2);
        Assert.assertEquals(driver.findElements(By.xpath("//div[@id='Prostate Cancer American Joint Committee on Cancer (AJCC) Edition 7 Pathologic Regional Lymph Node N Stage_1-1']//div//input[@type='radio']")).size(), 3);

        clickElement(By.id("displayProfiles_tab"));

        deleteWithConfirm("//*[@id = #profile_0]");
        hangon(1);
        deleteWithConfirm("//*[@id = #profile_0]");
        hangon(1);
        deleteWithConfirm("//*[@id = #profile_0]");
        hangon(1);
        deleteWithConfirm("//*[@id = #profile_0]");
        hangon(1);
        deleteWithConfirm("//*[@id = #profile_0]");

        newFormVersion();
        goToPreview();
        textNotPresent("Display Profile:");
        Assert.assertEquals(driver.findElements(By.cssSelector(".fa.fa-plus.iconButton")).size(), 0);
    }
}
