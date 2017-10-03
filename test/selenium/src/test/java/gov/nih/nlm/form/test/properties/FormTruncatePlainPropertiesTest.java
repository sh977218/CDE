package gov.nih.nlm.form.test.properties;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormTruncatePlainPropertiesTest extends NlmCdeBaseTest {

    @Test
    public void formTruncatePlainProperties() {
        String formName = "Family History - Affected Relatives and Pedigree";
        String newValue = "TBI:\n" +
                "Duhaime AC, Gean AD, Haacke EM, Hicks R, Wintermark M, Mukherjee P, Brody D, Latour L, " +
                "Riedy G; Common Data Elements Neuroimaging Working Group Members, Pediatric Working Group " +
                "Members. Common data elements in radiologic imaging of traumatic brain injury. Arch Phys Med " +
                "Rehabil. 2010 Nov;91(11):1661-6. [DOI: 10.1016/j.apmr.2010.07.238] Haacke, E.M., Duhaime, A.C., " +
                "Gean, A.D., Riedy, G., Wintermark, M., Mukherjee, P., Brody, D.L., DeGraba, T., Duncan, T.D., " +
                "and Elovic, E. (2010). Common data elements in radiologic imaging of traumatic brain injury. Journal " +
                "of Magnetic Resonance Imaging 32, 516-543, DOI:10.1002/jmri.22259";
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName(formName);
        clickElement(By.id("properties_tab"));
        addNewProperty("Great CTX", newValue);
        scrollToViewById("openNewPropertyModalBtn");
        clickElement(By.xpath("//*[@id='value_0']/descendant::span[text()='More']"));
        textPresent("516-543, DOI:10.1002/jmri.22259");
        textNotPresent("More", By.xpath("//*[@id='value_0']"));
    }
}
