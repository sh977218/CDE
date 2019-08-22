package gov.nih.nlm.form.test.displayProfile;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.annotations.Test;

import java.util.List;

public class DisplayProfilesNoMatrixTest extends BaseFormTest {

    @Test
    public void noMatrixDisplayProfile() {
        String formName = "No Matrix Display Profile Test";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        goToDisplayProfiles();

        DisplayProfile noMatrixDisplayProfile = new DisplayProfile(0, "No Matrix Display Profile", "Dynamic", 5, 0, false, false, false, false, false, false);
        createDisplayProfile(noMatrixDisplayProfile);

        goToPreview();
        List<WebElement> tdsInPreview = findElements(By.xpath("//cde-native-section-matrix//tr[1]//td"));
        checkMatrixLayout(tdsInPreview, false);

        goToDisplayProfiles();
        clickElement(By.id("profile_0"));
        List<WebElement> tdsInDisplayProfile = findElements(By.xpath("//*[@id='profile_0']//*[contains(@class,'displayProfilePreview')]//cde-native-section-matrix//tr[1]//td"));
        checkMatrixLayout(tdsInDisplayProfile, false);
    }
}
