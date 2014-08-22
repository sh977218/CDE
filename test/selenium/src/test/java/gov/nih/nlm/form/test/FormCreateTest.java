package gov.nih.nlm.form.test;

import org.testng.Assert;
import org.testng.annotations.Test;
import org.openqa.selenium.By;

public class FormCreateTest extends BaseFormTest {
        
    @Test
    public void createForm() {
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);

        String formName = "Create Form Test Name";
        String formDef = "Fill out carefully!";
        String formV = "0.1alpha";

        createForm(formName, formDef, formV, "CTEP");
        
        Assert.assertTrue(textPresent(formName));
        Assert.assertTrue(textPresent(formDef));
        Assert.assertTrue(textPresent(formV));
        
        gotoPublicForms();
        searchForm("Create Form Test Name");
        findElement(By.linkText("Create Form Test Name")).click();
        Assert.assertTrue(textPresent("Fill out carefully!"));        
    }    
}