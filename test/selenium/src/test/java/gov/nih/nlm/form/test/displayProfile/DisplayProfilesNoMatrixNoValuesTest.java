package gov.nih.nlm.form.test.displayProfile;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class DisplayProfilesNoMatrixNoValuesTest extends BaseFormTest {

    @Test
    public void noMatrixNoValuesDisplayProfiles() {
        String formName = "DisplayProfileNoMatrixNoValues";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        goToDisplayProfiles();

        createDisplayProfile(0, "No Matrix No Values", false, false, false, false, "Follow-up", 1, false, 0, true);

        goToFormByName(formName);
        goToDisplayProfiles();
        // use driver.findElement because zoom 60% makes element not visible
        int firstRadioY = driver.findElement(By.xpath("(//*[@id='profile_0']//table//input[@type='radio'])[1]")).getLocation().y;
        int fifthRadioY = driver.findElement(By.xpath("(//*[@id='profile_0']//table//input[@type='radio'])[5]")).getLocation().y;
        // no matrix makes radios lay in a column
        Assert.assertNotEquals(firstRadioY, fifthRadioY);

        String fifthRadioText = driver.findElement(By.xpath("(//*[@id='profile_0']//*[contains(@class,'native-section')]//table//input[@type='radio'])[5]/..")).getText().trim();
        Assert.assertEquals(fifthRadioText, "");

        int number_add_icon = driver.findElements(By.xpath("//*[@id='profile_0']//*[contains(@class,'displayProfilePreview')]//i")).size();
        Assert.assertTrue(number_add_icon > 0, "Expected number of add icon more than 0, actual number_add_icon is " + number_add_icon);
    }

}
