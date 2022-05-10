package gov.nih.nlm.cde.test.concepts;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class SearchByConcept extends NlmCdeBaseTest{
    @Test
    public void searchByConcept() {
        goToCdeByName("Classification Scheme Item Relationship Database Identifier java.lang.String");
        goToConcepts();
        clickElement(By.xpath("//*[@id='concept_cde_name_0' and . = 'Database']"));
        textPresent("Organism External Database Accession Number java.lang.String");
        textPresent("3 data element results");
        textPresent("property.concepts.name:\"Database\"", By.id("term_crumb"));
    }
}
