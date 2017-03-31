package gov.nih.nlm.cde.test.properties;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeTruncatePlainPropertiesTest extends NlmCdeBaseTest {

    @Test
    public void cdeTruncateRichPropertiesTest() {
        String cdeName = "Skull fracture morphology findings type";
        String newValue = "TBI:\n" +
                "Duhaime AC, Gean AD, Haacke EM, Hicks R, Wintermark M, Mukherjee P, Brody D, Latour L, Riedy G; Common Data Elements Neuroimaging Working Group Members, Pediatric Working Group Members. Common data elements in radiologic imaging of traumatic brain injury. Arch Phys Med Rehabil. 2010 Nov;91(11):1661-6. [DOI: 10.1016/j.apmr.2010.07.238] Haacke, E.M., Duhaime, A.C., Gean, A.D., Riedy, G., Wintermark, M., Mukherjee, P., Brody, D.L., DeGraba, T., Duncan, T.D., and Elovic, E. (2010). Common data elements in radiologic imaging of traumatic brain injury. Journal of Magnetic Resonance Imaging 32, 516-543, DOI:10.1002/jmri.22259";
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        editPropertyValueByIndex(1, newValue, false);

        scrollToViewById("openNewPropertyModalBtn");
        clickElement(By.xpath("//*[@id='value_1']/descendant::span[text()='More']"));
        textPresent("516-543, DOI:10.1002/jmri.22259");
        textNotPresent("More", By.xpath("//*[@id='value_1']"));
    }
}
