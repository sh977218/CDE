package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeMappingSpecificationTest extends NlmCdeBaseTest {


    @Test
    public void nonOwnerCantEdit() {
        String cdeName = "Tooth Sensitivity Mastication Second Oral Cavity Quadrant Assessment Scale";
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        findElement(By.linkText("Mappings")).click();
    }
    
    @Test
    public void addRemoveCdeProperty() {
        mustBeLoggedInAs(ninds_username, password);
        
        
        
        //test add
        addRemoveProperty("Aromatase Inhibitor Most Recent Received Text", null);

        // test autocomplete
    
        // test remove
    }
    
    
}
