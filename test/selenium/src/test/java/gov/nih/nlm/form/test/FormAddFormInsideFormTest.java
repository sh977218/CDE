package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import static com.jayway.restassured.RestAssured.get;

public class FormAddFormInsideFormTest extends BaseFormTest {
    QuestionTest questionTest = new QuestionTest();

    @Test
    public void addFormInsideFormTest() {
        String formName = "Study Drug Compliance";
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName(formName);
        clickElement(By.id("description_tab"));
        textPresent("Show Question Search Area");
        startAddingForms();
        questionTest.addFormToSection("Vessel Imaging Angiography", 0);
        textPresent("Embedded Form: Vessel Imaging Angiography");
        String newFormLabel = "new inner form label";
        clickElement(By.id("innerForm_label_edit_icon_Vessel Imaging Angiography"));
        findElement(By.xpath("//*[@id='innerForm_label_edit_icon_Vessel Imaging Angiography']//form/input")).clear();
        findElement(By.xpath("//*[@id='innerForm_label_edit_icon_Vessel Imaging Angiography']//form/input")).sendKeys(newFormLabel);
        clickElement(By.xpath("//*[@id='innerForm_label_edit_icon_Vessel Imaging Angiography']//form//button[contains(text(),'Confirm')]"));
        saveForm();

        goToFormByName(formName);
        textPresent("This form is large and is not automatically displayed.");
        clickElement(By.id("renderPreviewButton"));
        textPresent(newFormLabel);
        textPresent("Symptomology");

        clickElement(By.id("nativeFormRenderLink"));
        textPresent("Embedded Form: new inner form label");

        String odmResponse = get(baseUrl + "/form/m1j_L1HHte?type=xml&subtype=odm").asString();
        Assert.assertEquals(odmResponse.contains(newFormLabel), true, "Actual: " + odmResponse);

        String sdcResponse = get(baseUrl + "/form/m1j_L1HHte?type=xml&subtype=sdc").asString();
        Assert.assertEquals(sdcResponse.contains(newFormLabel), true, "Actual: " + sdcResponse);
        Assert.assertEquals(sdcResponse.contains("Symptomology"), true, "Actual: " + sdcResponse);
    }

}
