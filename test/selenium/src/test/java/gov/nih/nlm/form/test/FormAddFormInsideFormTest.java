package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import static com.jayway.restassured.RestAssured.get;

public class FormAddFormInsideFormTest extends BaseFormTest {
    QuestionTest questionTest = new QuestionTest();

    @Test
    public void addFormInsideFormTest() {
        String formName = "Vital Signs";
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName(formName);
        clickElement(By.id("description_tab"));
        textPresent("Show Question Search Area");
        startAddingForms();
        questionTest.addFormToSection("Vessel Imaging Angiography", 0);
        textPresent("Embedded Form: Vessel Imaging Angiography");
        saveForm();

        goToFormByName(formName);
        textPresent("This form is large and is not automatically displayed.");
        clickElement(By.id("renderPreviewButton"));
        textPresent("Vessel Imaging Angiography");

        clickElement(By.id("nativeFormRenderLink"));
        textPresent("Embedded Form: Vessel Imaging Angiography");

        String odmResponse = get(baseUrl + "/form/m1j_L1HHte?type=xml&subtype=odm").asString();
        Assert.assertEquals(odmResponse.contains("Vessel Imaging Angiography"), true);

        String sdcResponse = get(baseUrl + "/form/m1j_L1HHte?type=xml&subtype=sdc").asString();
        Assert.assertEquals(sdcResponse.contains("Vessel Imaging Angiography"), true);
    }

}
