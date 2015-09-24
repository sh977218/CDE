package gov.nih.nlm.cde.test;

import gov.nih.nlm.common.test.IdentifiersTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeIdentifierTest extends IdentifiersTest {
    
    @Test
    public void addRemoveCdeId() {
        addRemoveId("Intravesical Protocol Agent Administered Specify", null);
    }

    @Test
    public void findByNestedId() {
        mustBeLoggedInAs(ninds_username, password);
        goToEltByName("Ohio State TBI Method Short Form (OSUTBIMS) - ask question category");
        // same ID as cadsr Person Gender Text Type
        addId("FAKE", "C18059", "3");        
        
        goToCdeSearch();
    
        findElement(By.id("ftsearch-input")).sendKeys("ids.id:C18059");
        findElement(By.cssSelector("i.fa-search")).click(); 
        textPresent("2 results for");
        
        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("flatIds:\"FAKE C18059\"");
        findElement(By.cssSelector("i.fa-search")).click(); 
        textPresent("1 results for");
        
    }
    
    @Override
    public void goToEltByName(String name, String status) {
        goToCdeByName(name, status);
    }

    @Override
    public void goToEltSearch() {
        goToCdeSearch();
    }
    
    
}
