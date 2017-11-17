package gov.nih.nlm.form.test.displayProfile;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
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
        clickElement(By.xpath("//div[@id='question_0_3']//i[contains(@class,'fa-pencil')]"));
        clickElement(By.xpath("//div[@id='question_0_3']//div[text()='Invisible:']/following-sibling::div/input"));

        clickElement(By.id("displayProfiles_tab"));
        createDisplayProfile(0, "Matrix and Values", true, true, true, true, "Follow-up", 1, false);
        createDisplayProfile(1, "Matrix No Values", true, false, false, false, "Dynamic", 6, true);
        createDisplayProfile(2, "No Matrix No Values", false, false, false, false, "Follow-up", 1, false);
        createDisplayProfile(3, "No Matrix No Values Wider", false, false, false, false, "Follow-up", 5, false);
        scrollToTop();
        Assert.assertEquals(driver.findElements(By.xpath("//div[@id='profile_0']//table//input[@type='radio']")).size(), 10);
        textPresent("1", By.xpath("//div[@id='profile_0']//table/tbody/tr[1]/td[6]/span"));
        Assert.assertTrue(
                findElement(By.xpath("//div[@id='profile_2']//div[@id='Education level USA type_1']//label/span[text()='1st Grade']")).getLocation().y + 8 <
                        findElement(By.xpath("//div[@id='profile_2']//div[@id='Education level USA type_1']//label/span[text()='2nd Grade']")).getLocation().y
        );
        scrollToViewById("profile_3");
        Assert.assertEquals(
                findElement(By.xpath("//*[@id='profile_3']//*[*[text()='Education level USA type']]//*/span[text()='1st Grade']")).getLocation().y,
                findElement(By.xpath("//*[@id='profile_3']//*[*[text()='Education level USA type']]//*/span[text()='5th Grade']")).getLocation().y
        );
        newFormVersion();

        goToFormByName(formName);
        textPresent("In the past 7 days");
        textPresent("I felt annoyed");
        textPresent("1", By.xpath("//div[@id='formRenderSection_In the past 7 days']//table/tbody/tr[1]/td[2]"));
        textPresent("5", By.xpath("//div[@id='formRenderSection_In the past 7 days']//table/tbody/tr[1]/td[6]"));
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
        Assert.assertTrue(findElement(By.xpath("//div[@id='I was irritated more than people knew_0']//*/span[text()[contains(., 'Never')]]")).getLocation().y + 8 <
                findElement(By.xpath("//div[@id='I was irritated more than people knew_0']//*/span[text()[contains(., 'Rarely')]]")).getLocation().y
        );

        selectDisplayProfileByName("No Matrix No Values Wider");
        hangon(1);
        Assert.assertEquals(findElement(By.xpath("//*[*[text()='I was irritated more than people knew']]//*/span[text()='Never']")).getLocation().y,
                findElement(By.xpath("//*[*[text()='I was irritated more than people knew']]//*/span[text()='Always']")).getLocation().y
        );
        clickElement(By.id("displayProfiles_tab"));

        for (int i = 0; i < 4; i++) {
            clickElement(By.id("removeDisplayProfile-0"));
            clickElement(By.id("confirmRemoveDisplayProfile-0"));
        }

        newFormVersion();
        goToGeneralDetail();
        textNotPresent("Display Profile:");
    }

}