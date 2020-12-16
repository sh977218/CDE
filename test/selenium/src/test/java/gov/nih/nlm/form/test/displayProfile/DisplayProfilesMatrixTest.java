package gov.nih.nlm.form.test.displayProfile;

import gov.nih.nlm.form.test.BaseFormTest;
import org.testng.Assert;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class DisplayProfilesMatrixTest extends BaseFormTest {

    @Test
    public void displayProfilesMatrix() {
        String formName = "Matrix Display Profile Test";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);

        goToFormDescription();
        startEditQuestionById("question_0-1");
        clickElement(By.xpath("//div[@id='question_0-1']//*[contains(@class,'multipleSelection')]/input"));
        saveFormEdit();

        goToDisplayProfiles();
        DisplayProfile matrixDisplayProfile = new DisplayProfile(0, "Matrix Display Profile", "Digital (Dynamic style)", 5, 0, true, false, false, false, false, false);
        createDisplayProfile(matrixDisplayProfile);
        int number = findElements(By.xpath("//*[@id='display-profile-div']//cde-native-section-matrix//table//input[@type='radio']")).size();
        Assert.assertTrue(number > 0);

        goToPreview();
        number = findElements(By.xpath("//*[@id='preview-div']//cde-native-section-matrix//table//input[@type='radio']")).size();
        Assert.assertTrue(number > 0);
        number = findElements(By.xpath("//*[@id='preview-div']//cde-native-section-matrix//table//input[@type='checkbox']")).size();
        Assert.assertTrue(number == 5);

        goToDisplayProfiles();
        deleteDisplayProfile(0);
        DisplayProfile noMatrixDisplayProfile = new DisplayProfile(0,
                "No Matrix Display Profile",
                "Digital (Dynamic style)",
                4,
                0,
                false,
                false,
                false,
                false,
                false,
                false);
        createDisplayProfile(noMatrixDisplayProfile);
        number = driver.findElements(By.xpath("//*[@id='display-profile-div']//cde-native-section-matrix//table//input[@type='radio']")).size()
                + driver.findElements(By.xpath("//*[@id='display-profile-div']//cde-native-section-matrix//table//input[@type='checkbox']")).size();
        Assert.assertTrue(number == 0);

        goToPreview();
        number = driver.findElements(By.xpath("//*[@id='preview-div']//cde-native-section-matrix//table//input[@type='radio']")).size()
                + driver.findElements(By.xpath("//*[@id='preview-div']//cde-native-section-matrix//table//input[@type='checkbox']")).size();
        Assert.assertTrue(number == 0);
    }

}
