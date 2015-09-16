package gov.nih.nlm.cde.test;

import gov.nih.nlm.common.test.ReferenceDocumentTest;
import org.testng.annotations.Test;

public class CdeRefDocumentTest extends ReferenceDocumentTest {

    @Override
    public void goToEltByName(String name, String status) {
        goToCdeByName(name, status);
    }

    @Override
    public void goToEltSearch() {
        goToCdeSearch();
    }

    protected void goToElt(String eltName) {
        goToCdeByName(eltName);
    }

    @Test
    public void cdeReferenceDocumentTest() {
        referenceDocumentTest("Post traumatic amnesia verify type");
    }

    @Test
    public void cdeReorderReferenceDocument() {
        reorderReferenceDocumentTest("cde for test cde reorder detail tabs");
    }


}
