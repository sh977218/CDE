package gov.nih.nlm.form.test.displayProfile;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class DisplayProfilesTest extends BaseFormTest {

    @Test
    public void createDisplayProfiles() {
        String formName = "Neuro-QOL Ped Bank v2.0 - Cognitive Function";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        goToDisplayProfiles();

        createDisplayProfile(0, "No Matrix No Values Wider", false, false, false, false, "Print (Follow-up style)", 5, false, 0);
        scrollToTop();

        scrollToViewById("profile_0");
        // 5 columns across with first item hoisted up by skip logic
        String baseXpath = "//*[@id='profile_0']//*[contains(@class,'nativeRenderPreview')]//*[*[normalize-space()='Education level USA type']]//";
        int i = 5;
        while (i >= 0) {
            if (i == 0) Assert.fail("Unexpected y value");
            int firstGradeY = findElement(By.xpath(baseXpath + byValueListValueXPath("1st Grade"))).getLocation().y;
            int fifthGrade = findElement(By.xpath(baseXpath + byValueListValueXPath("5th Grade"))).getLocation().y;

            if (firstGradeY == fifthGrade) {
                break;
            }
            i--;
            hangon(2);
        }
    }

}
