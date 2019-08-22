package gov.nih.nlm.form.test.displayProfile;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class DisplayProfilesNoMatrixNoValuesWiderTest extends BaseFormTest {

    @Test
    public void noMatrixNoValuesWiderDisplayProfiles() {
        String formName = "No Matrix No Answer Value Wider Profile Test";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        goToDisplayProfiles();

        DisplayProfile noMatrixNoAnswerValueWiderDisplayProfile = new DisplayProfile(0,"No Matrix No Answer Value Wider Display Profile","Follow-up",5,0,false,false,false,false,false,false);
        createDisplayProfile(noMatrixNoAnswerValueWiderDisplayProfile);

        // 5 columns across with first item hoisted up by skip logic
        String baseXpath = "//*[@id='profile_0']//*[contains(@class,'displayProfileRenderDiv')]//*[*[normalize-space()='Education level USA type']]//";
        int i = 5;
        while (i >= 0) {
            int firstGradeY = findElement(By.xpath(baseXpath + byValueListValueXPath("1st Grade"))).getLocation().y;
            int fifthGradeY = findElement(By.xpath(baseXpath + byValueListValueXPath("5th Grade"))).getLocation().y;
            if (i == 0) {
                Assert.fail("After 5 tries, firstGradeY: " + firstGradeY + " is not equal to fifthGradeY: " + fifthGradeY);
            }
            if (firstGradeY == fifthGradeY) {
                break;
            }
            i--;
            hangon(2);
        }
    }

}
