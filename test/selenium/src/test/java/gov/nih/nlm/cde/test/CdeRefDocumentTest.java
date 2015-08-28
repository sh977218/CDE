package gov.nih.nlm.cde.test;

import gov.nih.nlm.cde.common.test.ReferenceDocumentTest;
import org.testng.annotations.Test;

public class CdeRefDocumentTest extends ReferenceDocumentTest {

    protected void goToElt(String eltName) {
        goToCdeByName(eltName);
    }

    @Test
    public void cdeReferenceDocumentTest() {
        referenceDocumentTest("Post traumatic amnesia verify type");
    }

}
