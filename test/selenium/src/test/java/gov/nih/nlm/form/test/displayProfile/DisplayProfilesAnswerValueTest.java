package gov.nih.nlm.form.test.displayProfile;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.annotations.Test;

import java.util.List;

public class DisplayProfilesAnswerValueTest extends BaseFormTest {

    @Test
    public void displayProfileAnswerValue() {
        String formName = "Answer Value Display Profile Test";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);

        goToFormDescription();
        startEditQuestionById("question_0-0");
        nonNativeSelect("//dt[contains(.,'Display As')]/following-sibling::dd[1]", "", "Likert Scale");
        textPresent("Likert Scale");
        saveEditQuestionById("question_0-0");
        textPresent("Likert Scale");
        saveFormEdit();
        goToDisplayProfiles();

        createDisplayProfile(new DisplayProfile(
                0,
                "Answer Value Display Profile",
                "Digital (Dynamic style)",
                5,
                0,
                false,
                true,
                false,
                false,
                false,
                false
        ));

        List<WebElement> tdsInDisplayProfile = findElements(By.xpath("//*[@id='profile_0']//*[contains(@class,'nativeRenderPreview')]//*[contains(@class,'form-check-label')]"));
        checkAnswerValue(tdsInDisplayProfile, true);

        goToPreview();
        List<WebElement> tdsInPreview = findElements(By.xpath("//label[contains(@class,'form-check-label')]/span"));
        checkAnswerValue(tdsInPreview, true);
        findElement(By.xpath("//li[contains(.,'Not at all')]/span[contains(.,'5')]"));

        goToDisplayProfiles();
        deleteDisplayProfile(0);

        DisplayProfile noAnswerValueDisplayProfile = new DisplayProfile(0, "No Answer Value Display Profile", "Digital (Dynamic style)", 5, 0, false, false, false, false, false, false);
        createDisplayProfile(noAnswerValueDisplayProfile);

        // use driver.findElements to check answer value elements are not visible on page.
        tdsInDisplayProfile = driver.findElements(By.xpath("//*[@id='profile_0']//*[contains(@class,'nativeRenderPreview')]//*[contains(@class,'form-check-label')]/span"));
        checkAnswerValue(tdsInDisplayProfile, false);

        goToPreview();
        tdsInPreview = driver.findElements(By.xpath("//label[contains(@class,'form-check-label')]/span"));
        checkAnswerValue(tdsInPreview, false);
    }
}
