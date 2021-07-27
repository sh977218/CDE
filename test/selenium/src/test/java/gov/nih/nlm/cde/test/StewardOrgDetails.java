package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class StewardOrgDetails extends NlmCdeBaseTest {

    @Test
    public void checkStewardOrgDetails() {
        String cdeName1 = "Feature Modified By java.lang.String";
        goToCdeByName(cdeName1);
        By by = By.xpath("//*[@id='stewardOrg']//span");
        checkTooltipText(by, "Organization Details");
        checkTooltipText(by, "Cancer Biomedical Informatics Grid");
        checkTooltipText(by, "123 Somewhere On Earth, Abc, Def, 20001");
        checkTooltipText(by, "caBig@nih.gov");
        checkTooltipText(by, "111-222-3333");
        checkTooltipText(by, "https://cabig.nci.nih.gov/");

        String cdeName2 = "Lesion Nontarget Location Type";
        goToCdeByName(cdeName2);
        checkTooltipText(by, "Organization Details");
        checkTooltipText(by, "Cancer Therapy Evaluation Program");
        checkTooltipText(by, "75 Sunshine Street, Blah, Doh 12345");
        checkTooltipText(by, "https://cabig.nci.nih.gov/");
    }
}
