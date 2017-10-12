package gov.nih.nlm.cde.test.concepts;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class SearchByConcept extends NlmCdeBaseTest{
    @Test
    public void searchByConcept() {
        goToCdeByName("Classification Scheme Item Relationship Database Identifier java.lang.String");
        clickElement(By.id("concepts_tab"));
        clickElement(By.id("concept_cde_name_0"));
        textPresent("Organism External Database Accession Number java.lang.String");
        textPresent("2 results for property.concepts.name:\"Database\"");
    }
}
