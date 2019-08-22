package gov.nih.nlm.form.test.displayProfile;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class DisplayProfilesNoMetadataDeviceTest extends BaseFormTest {

    @Test
    public void metadataDeviceDisplayProfile() {
        String formName = "No Metadata Device Display Profile Test";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        goToDisplayProfiles();

        DisplayProfile noMetadataDeviceDisplayProfile = new DisplayProfile(0, "Metadata Device Display Profile", "Dynamic", 5, 0, false, false, false, false, false, false);
        createDisplayProfile(noMetadataDeviceDisplayProfile);

        int number_add_icon = findElements(By.xpath("//*[@id='profile_0']//*[contains(@class,'displayProfilePreview')]//i")).size();
        Assert.assertTrue(number_add_icon > 0, "Expected number of add icon is 0, actual number_add_icon is " + number_add_icon);
    }
}
