package gov.nih.nlm.cde.test;

import gov.nih.nlm.cde.common.test.PropertyTest;
import org.testng.annotations.Test;

public class CdePropertyTest extends PropertyTest {
   
    @Override
    public void goToEltByName(String name) {
        goToCdeByName(name);
    }

    @Test
    public void addRemoveCdeProperty() {
        addRemoveProperty("Aromatase Inhibitor Most Recent Received Text");
    }
    
    @Test
    public void richPropText() {
        richText("Imaging diffusion sixth b value");
    }
    
}
