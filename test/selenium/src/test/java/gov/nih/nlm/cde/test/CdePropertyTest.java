package gov.nih.nlm.cde.test;

import gov.nih.nlm.common.test.PropertyTest;
import org.testng.annotations.Test;

public class CdePropertyTest extends PropertyTest {

    @Override
    public void goToEltByName(String name, String status) {
        goToCdeByName(name, status);
    }

    @Override
    public void goToEltSearch() {
        goToCdeSearch();
    }

    @Test
    public void autocomplete() {
        autocomplete("Retinoblastoma History Ind-3", "NINDS G", "NINDS Guidelines");
    }

    @Test
    public void richPropText() {
        richText("Imaging diffusion sixth b value", null);
    }

    @Test
    public void truncateRichText() {
        truncateRichText("Skull fracture morphology findings type", null);
    }

    @Test
    public void truncatePlainText() {
        truncatePlainText("Skull fracture morphology findings type", null);
    }

    @Test
    public void reorderProperties() {
        reorderProperties("cde for test cde reorder detail tabs");
    }

}
