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

        DisplayProfile multipleSelectDisplayProfile = new DisplayProfile(0, "Multiple Select Display Profile", "Dynamic", 6, 3, false, false, false, false, false, false);
        createDisplayProfile(multipleSelectDisplayProfile);

        /*@TODO
        Multiple Select options require to reload the page to work.
        Is it a bug?
         */
        goToFormByName(formName);

        int number_select_in_preview = findElements(By.xpath("//cde-native-section//select")).size();
        Assert.assertTrue(number_select_in_preview > 0);

        goToDisplayProfiles();
        toggleDisplayProfile(0);
        int number_select_in_display_profile = findElements(By.xpath("//cde-native-section//select")).size();
        Assert.assertTrue(number_select_in_display_profile > 0);

        deleteDisplayProfile(0);
        DisplayProfile noMultipleSelectDisplayProfile = new DisplayProfile(0, "No Multiple Select Display Profile", "Dynamic", 6, 15, false, false, false, false, false, false);
        createDisplayProfile(noMultipleSelectDisplayProfile);

        /*@TODO
        Multiple Select options require to reload the page to work.
        Is it a bug?
         */
        goToFormByName(formName);

        number_select_in_preview = driver.findElements(By.xpath("//cde-native-section//select")).size();
        Assert.assertTrue(number_select_in_preview == 0);

        goToDisplayProfiles();
        toggleDisplayProfile(0);
        number_select_in_display_profile = driver.findElements(By.xpath("//cde-native-section//select")).size();
        Assert.assertTrue(number_select_in_display_profile == 0);


    }

}