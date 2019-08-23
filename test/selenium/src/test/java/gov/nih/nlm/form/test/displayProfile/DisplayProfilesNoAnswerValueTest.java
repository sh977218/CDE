package gov.nih.nlm.form.test.displayProfile;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.annotations.Test;

import java.util.List;

public class DisplayProfilesNoAnswerValueTest extends BaseFormTest {

    @Test
    public void noAnswerValueDisplayProfile() {
        String formName = "No Answer Value Display Profile Test";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        goToDisplayProfiles();

        DisplayProfile noAnswerValueDisplayProfile = new DisplayProfile(0, "No Answer Value Display Profile", "Dynamic", 5, 0, false, false, false, false, false, false);
        createDisplayProfile(noAnswerValueDisplayProfile);

        List<WebElement> tdsInDisplayProfile = driver.findElements(By.xpath("//*[@id='profile_0']//*[contains(@class,'displayProfilePreview')]//*[contains(@class,'form-check-label')]"));
        checkAnswerValue(tdsInDisplayProfile, false);

        goToPreview();
        List<WebElement> tdsInPreview = findElements(By.xpath("//label[contains(@class,'form-check-label')]/span"));
        checkAnswerValue(tdsInPreview, false);

    }
}
