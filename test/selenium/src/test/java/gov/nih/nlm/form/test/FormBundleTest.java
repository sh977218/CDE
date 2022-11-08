package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormBundleTest extends NlmCdeBaseTest {

    @Test
    public void formBundleTest() {
        String formName = "Acute Admission/Discharge";
        By byBundleButton = By.xpath("//button" + xpathText("group Create Bundle"));
        By byUnbundleButton = By.xpath("//button" + xpathText("group_off Destroy Bundle"));

        goToFormByName(formName);
        generalDetailsPropertyValueContains("Is a Bundle", "No");

        mustBeLoggedInAs(testEditor_username, password);
        textPresent(formName);
        generalDetailsPropertyValueContains("Is a Bundle", "No");
        assertNoElt(byBundleButton);
        assertNoElt(byUnbundleButton);

        mustBeLoggedInAs(nlm_username, nlm_password);
        textPresent(formName);
        generalDetailsPropertyValueContains("Is a Bundle", "No");
        findElement(byBundleButton);
        assertNoElt(byUnbundleButton);

        clickElement(byBundleButton);
        generalDetailsPropertyValueContains("Is a Bundle", "Yes");
        assertNoElt(byBundleButton);
        findElement(byUnbundleButton);

        clickElement(byUnbundleButton);
        generalDetailsPropertyValueContains("Is a Bundle", "No");
        findElement(byBundleButton);
        assertNoElt(byUnbundleButton);
    }
}
