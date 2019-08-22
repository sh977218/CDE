package gov.nih.nlm.form.test.displayProfile;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class DisplayProfilesMatrixNoValuesTest extends BaseFormTest {

    @Test
    public void matrixNoValuesDisplayProfiles() {
        String formName = "DisplayProfileMatrixNoValues";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        goToDisplayProfiles();

        createDisplayProfile(0, "Matrix No Values", true, false, false, false, "Dynamic", 6, true, 0, false);
        scrollToTop();
        // use driver.findElement because zoom 60% makes element not visible
        int firstRadioY = driver.findElement(By.xpath("(//*[@id='profile_0']//table//input[@type='radio'])[1]")).getLocation().y;
        int fifthRadioY = driver.findElement(By.xpath("(//*[@id='profile_0']//table//input[@type='radio'])[5]")).getLocation().y;
        // matrix makes radios lay in a row
        Assert.assertEquals(firstRadioY, fifthRadioY);

        String fifthRadioText = driver.findElement(By.xpath("(//*[@id='profile_0']//*[contains(@class,'native-section')]//table//input[@type='radio'])[5]/..")).getText().trim();
        Assert.assertEquals(fifthRadioText, "");

        newFormVersion();

    }

}
