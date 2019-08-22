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

        DisplayProfile noAnswerValueDisplayProfile = new DisplayProfile(0, "No Answer Value Display Profile", "Dynamic", 5, 0, false, true, false, false, false, false);
        createDisplayProfile(noAnswerValueDisplayProfile);

        goToPreview();
        List<WebElement> tdsInPreview = findElements(By.xpath("//cde-native-section-matrix//tr[1]//td[input]"));
        checkAnswerValue(tdsInPreview, false);

        goToDisplayProfiles();
        clickElement(By.id("profile_0"));
        List<WebElement> tdsInDisplayProfile = findElements(By.xpath("//*[@id='profile_0']//*[contains(@class,'displayProfilePreview')]//cde-native-section-matrix//tr[1]//td[input]"));
        checkAnswerValue(tdsInDisplayProfile, false);
    }
}
