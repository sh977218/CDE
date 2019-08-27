package gov.nih.nlm.form.test.displayProfile;

import gov.nih.nlm.form.test.BaseFormTest;
import org.junit.Assert;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class DisplayProfilesMatrixTest extends BaseFormTest {

    @Test
    public void matrixDisplayProfile() {
        String formName = "Matrix Display Profile Test";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        goToDisplayProfiles();

        DisplayProfile matrixDisplayProfile = new DisplayProfile(0, "Matrix Display Profile", "Dynamic", 5, 0, true, false, false, false, false, false);
        createDisplayProfile(matrixDisplayProfile);

        int number_matrix_in_display_profile = findElements(By.xpath("//cde-native-section-matrix//table//input[@type='radio']")).size();
        Assert.assertTrue(number_matrix_in_display_profile > 0);

        goToPreview();
        int number_matrix_in_preview = findElements(By.xpath("//cde-native-section-matrix//table//input[@type='radio']")).size();
        Assert.assertTrue(number_matrix_in_preview > 0);

        goToDisplayProfiles();
        deleteDisplayProfile(0);

        DisplayProfile noMatrixDisplayProfile = new DisplayProfile(0, "No Matrix Display Profile", "Dynamic", 4, 0, false, false, false, false, false, false);
        createDisplayProfile(noMatrixDisplayProfile);

        // use driver.findElements to check matrix elements are not in html.
        number_matrix_in_display_profile = driver.findElements(By.xpath("//cde-native-section-matrix//table//input[@type='radio']")).size();
        Assert.assertTrue(number_matrix_in_display_profile == 0);

        goToPreview();
        number_matrix_in_preview = driver.findElements(By.xpath("//cde-native-section-matrix//table//input[@type='radio']")).size();
        Assert.assertTrue(number_matrix_in_preview == 0);

    }
}