package gov.nih.nlm.form.test.displayProfile;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class DisplayProfilesNoMatrixNoValuesWiderTest extends BaseFormTest {

    @Test
    public void noMatrixNoValuesWiderDisplayProfiles() {
        String formName = "DisplayProfileNoMatrixNoValuesWider";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        goToDisplayProfiles();

        createDisplayProfile(0, "No Matrix No Values Wider", false, false, false, false, "Follow-up", 5, false, 0, false);

        goToFormByName(formName);
        goToDisplayProfiles();
        // use driver.findElement because zoom 60% makes element not visible
        int firstRadioY = driver.findElement(By.xpath("(//*[@id='profile_0']//table//input[@type='radio'])[1]")).getLocation().y;
        int fifthRadioY = driver.findElement(By.xpath("(//*[@id='profile_0']//table//input[@type='radio'])[5]")).getLocation().y;
        // no matrix makes radios lay in a column
        Assert.assertNotEquals(firstRadioY, fifthRadioY);

        String fifthRadioText = driver.findElement(By.xpath("(//*[@id='profile_0']//*[contains(@class,'native-section')]//table//input[@type='radio'])[5]/..")).getText().trim();
        Assert.assertEquals(fifthRadioText, "");

        // 5 columns across with first item hoisted up by skip logic
        String baseXpath = "//*[@id='profile_0']//*[contains(@class,'displayProfileRenderDiv')]//*[*[normalize-space()='Education level USA type']]//";
        int i = 5;
        while (i >= 0) {
            int firstGradeY = findElement(By.xpath(baseXpath + byValueListValueXPath("1st Grade"))).getLocation().y;
            int fifthGradeY = findElement(By.xpath(baseXpath + byValueListValueXPath("5th Grade"))).getLocation().y;
            if (i == 0) {
                Assert.fail("After 5 tries, firstGradeY: " + firstGradeY + " is not equal to fifthGradeY: " + fifthGradeY);
            }
            if (firstGradeY == fifthGradeY) {
                break;
            }
            i--;
            hangon(2);
        }
    }

}
