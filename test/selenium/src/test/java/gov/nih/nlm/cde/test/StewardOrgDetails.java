package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class StewardOrgDetails extends NlmCdeBaseTest {

    @Test
    public void checkStewardOrgDetails() {
        goToCdeByName("Feature Modified By java.lang.String");
        By by = By.id("dd_general_steward_name");
        checkTooltipText(by, "Organization Details");
        checkTooltipText(by, "Cancer Biomedical Informatics Grid");
        checkTooltipText(by, "123 Somewhere On Earth, Abc, Def, 20001");
        checkTooltipText(by, "caBig@nih.gov");
        checkTooltipText(by, "111-222-3333");
        checkTooltipText(by, "https://cabig.nci.nih.gov/");

        goToCdeByName("Lesion Nontarget Location Type");
        by = By.linkText("CTEP");
        hoverOverElement(findElement(By.linkText("CTEP")));
        checkTooltipText(by, "Organization Details");
        checkTooltipText(by, "Cancer Therapy Evaluation Program");
        checkTooltipText(by, "75 Sunshine Street, Blah, Doh 12345");
        checkTooltipText(by, "https://cabig.nci.nih.gov/");
    }
}
