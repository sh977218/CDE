package gov.nih.nlm.form.test.displayProfile;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.annotations.Test;

import java.util.List;

public class DisplayProfilesAnswerValueTest extends BaseFormTest {

    @Test
    public void answerValueDisplayProfile() {
        String formName = "Answer Value Display Profile Test";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        goToDisplayProfiles();

        DisplayProfile answerValueDisplayProfile = new DisplayProfile(0, "Answer Value Display Profile", "Dynamic", 5, 0, false, true, false, false, false, false);
        createDisplayProfile(answerValueDisplayProfile);

        List<WebElement> tdsInDisplayProfile = findElements(By.xpath("//*[@id='profile_0']//*[contains(@class,'displayProfilePreview')]//*[contains(@class,'form-check-label')]"));
        checkAnswerValue(tdsInDisplayProfile, true);

        goToPreview();
        List<WebElement> tdsInPreview = findElements(By.xpath("//label[contains(@class,'form-check-label')]/span"));
        checkAnswerValue(tdsInPreview, true);

        goToDisplayProfiles();
        deleteDisplayProfile(0);

        DisplayProfile noAnswerValueDisplayProfile = new DisplayProfile(0, "No Answer Value Display Profile", "Dynamic", 5, 0, false, false, false, false, false, false);
        createDisplayProfile(noAnswerValueDisplayProfile);

        // use driver.findElements to check answer value elements are not visible on page.
        tdsInDisplayProfile = driver.findElements(By.xpath("//*[@id='profile_0']//*[contains(@class,'displayProfilePreview')]//*[contains(@class,'form-check-label')]/span"));
        checkAnswerValue(tdsInDisplayProfile, false);

        goToPreview();
        tdsInPreview = driver.findElements(By.xpath("//label[contains(@class,'form-check-label')]/span"));
        checkAnswerValue(tdsInPreview, false);
    }
}