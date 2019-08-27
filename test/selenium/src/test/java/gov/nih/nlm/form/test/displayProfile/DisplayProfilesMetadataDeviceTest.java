package gov.nih.nlm.form.test.displayProfile;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class DisplayProfilesMetadataDeviceTest extends BaseFormTest {

    @Test
    public void metadataDeviceDisplayProfile() {
        String formName = "Metadata Device Display Profile Test";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        goToDisplayProfiles();

        DisplayProfile metadataDeviceDisplayProfile = new DisplayProfile(0, "Metadata Device Display Profile", "Dynamic", 5, 0, false, false, false, false, false, true);
        createDisplayProfile(metadataDeviceDisplayProfile);

        int number_add_icon_in_display_profile = findElements(By.xpath("//cde-native-section//i")).size();
        Assert.assertTrue(number_add_icon_in_display_profile > 0);

        goToPreview();
        int number_add_icon_in_preview = findElements(By.xpath("//cde-native-section//i")).size();
        Assert.assertTrue(number_add_icon_in_preview > 0);

        goToDisplayProfiles();
        deleteDisplayProfile(0);

        DisplayProfile noMetadataDeviceDisplayProfile = new DisplayProfile(0, "Metadata Device Display Profile", "Dynamic", 5, 0, false, false, false, false, false, false);
        createDisplayProfile(noMetadataDeviceDisplayProfile);

        // use driver.findElements to check meta data device elements are not in html.
        number_add_icon_in_display_profile = driver.findElements(By.xpath("//cde-native-section//i")).size();
        Assert.assertTrue(number_add_icon_in_display_profile == 0);

        goToPreview();
        number_add_icon_in_preview = driver.findElements(By.xpath("//cde-native-section//i")).size();
        Assert.assertTrue(number_add_icon_in_preview == 0);
    }
}