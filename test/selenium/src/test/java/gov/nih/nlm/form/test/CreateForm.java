package gov.nih.nlm.form.test;

import org.testng.Assert;
import org.testng.annotations.Test;

public class CreateForm extends BaseFormTest {

    @Test
    public void createForm() {
        mustBeLoggedInAs(ctepCurator_username, password);

        String formName = "Create Form Test Name";
        String formDef = "Fill out carefully!";
        String formV = "0.1alpha";

        createForm(formName, formDef, formV, "CTEP");

        Assert.assertTrue(textPresent(formName));
        Assert.assertTrue(textPresent(formDef));
        Assert.assertTrue(textPresent(formV));

        goToFormByName("Create Form Test Name", "Incomplete");
        textPresent("Fill out carefully!");
    }

}
