package gov.nih.nlm.form.test;

import gov.nih.nlm.cde.common.test.ReferenceDocumentTest;
import org.testng.annotations.Test;

public class FormRefDocumentTest extends ReferenceDocumentTest {

    protected void goToElt(String eltName) {
        goToFormByName(eltName);
    }

    @Test
    public void formReferenceDocumentTest() {
        referenceDocumentTest("PROMIS SF v1.0-Anxiety 8a");
    }

}