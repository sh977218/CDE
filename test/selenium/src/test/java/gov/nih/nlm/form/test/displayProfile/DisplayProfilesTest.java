package gov.nih.nlm.form.test.displayProfile;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class DisplayProfilesTest extends BaseFormTest {

    @Test
    public void createDisplayProfiles() {
        String formName = "Neuro-QOL Ped Bank v2.0 - Cognitive Function";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        clickElement(By.id("displayProfiles_tab"));

        createDisplayProfile(0, "Matrix and Values", true, true, true, true, "Follow-up", 1, false, 0);
        createDisplayProfile(1, "Matrix No Values", true, false, false, false, "Dynamic", 6, true, 0);
        createDisplayProfile(2, "No Matrix No Values", false, false, false, false, "Follow-up", 1, false, 0);
        clickElement(By.id("displayMetadataDevice_2"));
        createDisplayProfile(3, "No Matrix No Values Wider", false, false, false, false, "Follow-up", 5, false, 0);
        createDisplayProfile(4, "Multiple Select", false, false, false, false, "Dynamic", 5, false, 4);
        scrollToTop();

        // use driver.findElement because zoom 60% makes element not visible
        Assert.assertEquals(driver.findElements(By.xpath("//*[@id='profile_0']//table//input[@type='radio']")).size(), 10);
        Assert.assertEquals(driver.findElement(By.xpath("(//*[@id='profile_0']//*[contains(@class,'native-section')]//table//input[@type='radio'])[5]/../span")).getText(), "1");


        scrollToViewById("profile_3");
        // 5 columns across with first item hoisted up by skip logic
        String baseXpath = "//*[@id='profile_3']//*[contains(@class,'displayProfileRenderDiv')]//*[*[normalize-space()='Education level USA type']]//";
        int i = 5;
        while (i >= 0) {
            int firstGradeY = findElement(By.xpath(baseXpath + byValueListValueXPath("1st Grade"))).getLocation().y;
            int fifthGrade = findElement(By.xpath(baseXpath + byValueListValueXPath("5th Grade"))).getLocation().y;
            if (i == 0) {
                Assert.fail("After 5 tries, firstGradeY: " + firstGradeY + " is not equal to fifthGrade: " + fifthGrade);
            }
            if (firstGradeY == fifthGrade) {
                break;
            }
            i--;
            hangon(2);
        }


        newFormVersion();

        deleteWithConfirm("//*[@id = 'profile_0']");
        hangon(1);
        deleteWithConfirm("//*[@id = 'profile_0']");
        hangon(1);
        deleteWithConfirm("//*[@id = 'profile_0']");
        hangon(1);
        deleteWithConfirm("//*[@id = 'profile_0']");
        hangon(1);
        deleteWithConfirm("//*[@id = 'profile_0']");

        newFormVersion();
        goToPreview();
        textNotPresent("Display Profile:");
    }

}
