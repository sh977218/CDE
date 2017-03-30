package gov.nih.nlm.cde.test;

import gov.nih.nlm.common.test.PropertyTest;
import org.testng.annotations.Test;

public class CdePropertyTest extends PropertyTest {

    @Override
    public void goToEltByName(String name, String status) {
        goToCdeByName(name);
    }

    @Override
    public void goToEltSearch() {
        goToCdeSearch();
    }


    @Test
    public void richPropText() {
        mustBeLoggedInAs(ninds_username, password);
        richText("Imaging diffusion sixth b value", null);
    }

    @Test
    public void cdeTruncateRichText() {
        truncateRichText("Skull fracture morphology findings type");
    }

    @Test
    public void cdeTruncatePlainText() {
        truncatePlainText("Skull fracture morphology findings type");
    }

    @Test
    public void reorderProperties() {
        reorderPropertyTest("cde for test cde reorder detail tabs");
    }

}
