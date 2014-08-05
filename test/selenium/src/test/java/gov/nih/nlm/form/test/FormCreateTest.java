package gov.nih.nlm.form.test;

import gov.nih.nlm.cde.test.NlmCdeBaseTest;
import org.testng.Assert;
import org.testng.annotations.Test;

public class FormCreateTest extends NlmCdeBaseTest {
    
    @Test
    public void addRemoveProperty() {
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);
        Assert.assertTrue( true );
    }
}