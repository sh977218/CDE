package gov.nih.nlm.form.test;

import gov.nih.nlm.common.test.ReferenceDocumentTest;
import org.testng.annotations.Test;

public class FormRefDocumentTest extends ReferenceDocumentTest {

    @Override
    public void goToEltByName(String name, String status) {
        goToFormByName(name);
    }

    @Override
    public void goToEltSearch() {
        goToFormSearch();
    }

    protected void goToElt(String eltName) {
        goToFormByName(eltName);
    }

    @Test
    public void formReorderReferenceDocumentTest() {
        reorderReferenceDocumentTest("form for test cde reorder detail tabs");
    }

}
