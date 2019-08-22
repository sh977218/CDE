package gov.nih.nlm.form.test.displayProfile;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class DisplayProfilesMultipleSelectTest extends BaseFormTest {

    @Test
    public void multipleSelectDisplayProfiles() {
        String formName = "DisplayProfileMultipleSelect";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        goToDisplayProfiles();

        createDisplayProfile(0, "Multiple Select", false, false, false, false, "Dynamic", 5, false, 4, false);

        goToFormByName(formName);
        goToDisplayProfiles();
        // use driver.findElement because zoom 60% makes element not visible
        int number_select = driver.findElements(By.xpath("//*[@id='profile_0']//*[contains(@class,'displayProfilePreview')]//select")).size();
        Assert.assertTrue(number_select > 0, "Expected number of select more than 0, actual number_select is " + number_select);
    }

}
