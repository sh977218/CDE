package gov.nih.nlm.form.test.displayProfile;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class DisplayProfilesMatrixAndValuesTest extends BaseFormTest {

    @Test
    public void matrixAndValuesDisplayProfiles() {
        String formName = "DisplayProfileMatrixAndValues";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        goToDisplayProfiles();

        createDisplayProfile(0, "Matrix and Values", true, true, true, true, "Follow-up", 1, false, 0, false);
        scrollToTop();

        // use driver.findElement because zoom 60% makes element not visible
        int firstRadioY = driver.findElement(By.xpath("(//*[@id='profile_0']//table//input[@type='radio'])[1]")).getLocation().y;
        int fifthRadioY = driver.findElement(By.xpath("(//*[@id='profile_0']//table//input[@type='radio'])[5]")).getLocation().y;
        // matrix makes radios lay in a row
        Assert.assertEquals(firstRadioY, fifthRadioY);

        String fifthRadioText = driver.findElement(By.xpath("(//*[@id='profile_0']//*[contains(@class,'native-section')]//table//input[@type='radio'])[5]/..")).getText();
        Assert.assertEquals(fifthRadioText, "1");
        newFormVersion();
    }

}
