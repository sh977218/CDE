package gov.nih.nlm.cde.test;

import gov.nih.nlm.common.test.ConceptTest;
import org.testng.annotations.Test;

public class CdeConceptTest extends ConceptTest {
    @Override
    public void goToEltByName(String name, String status) {
        goToCdeByName(name, status);
    }

    @Override
    public void goToEltSearch() {
        goToCdeSearch();
    }

    @Test
    public void reorderConcept() {
        reorderConceptTest("cde for test cde reorder detail tabs");
    }
}
