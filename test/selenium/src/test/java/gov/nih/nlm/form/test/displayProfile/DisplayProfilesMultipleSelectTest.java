package gov.nih.nlm.form.test.displayProfile;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class DisplayProfilesMultipleSelectTest extends BaseFormTest {

    @Test
    public void multipleSelectDisplayProfiles() {
        String formName = "Multiple Select Display Profile Test";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        goToDisplayProfiles();

        DisplayProfile multipleSelectDisplayProfile = new DisplayProfile(0,"Multiple Select Display Profile","Dynamic",5,4,false,false,false,false,false,false);
        createDisplayProfile(multipleSelectDisplayProfile);

        int number_select = findElements(By.xpath("//*[@id='profile_0']//*[contains(@class,'displayProfilePreview')]//select")).size();
        Assert.assertTrue(number_select > 0, "Expected number of select more than 0, actual number_select is " + number_select);
    }

}
