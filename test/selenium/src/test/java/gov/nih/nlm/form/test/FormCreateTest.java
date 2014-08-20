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

    }
    
    @Test(dependsOnMethods = {"gov.nih.nlm.form.test.FormCreateTest.createForm"})
    public void listForms() {
        gotoPublicForms();
        findElement(By.linkText("Create Form Test Name")).click();
        Assert.assertTrue(textPresent("Fill out carefully!"));
        Assert.assertTrue(textPresent("Incomplete"));      
        findElement(By.id("status-text-Recorded")).click();  
        Assert.assertTrue(textNotPresent("Create Form Test Name"));   
        findElement(By.id("status-text-Recorded")).click();       
        Assert.assertTrue(textPresent("Create Form Test Name"));
    }
}