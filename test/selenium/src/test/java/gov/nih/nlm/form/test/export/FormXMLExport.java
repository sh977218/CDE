package gov.nih.nlm.form.test.export;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import static com.jayway.restassured.RestAssured.get;

public class FormXMLExport extends NlmCdeBaseTest {

    @Test
    public void xmlExport() {
        mustBeLoggedInAs(reguser_username, password);
        String form = "Parenchymal Imaging";
        goToFormByName(form);

        findElement(By.id("export")).click();
        String url = findElement(By.id("nihXml")).getAttribute("href");
        String response = get(url).asString();
        Assert.assertTrue(response.replaceAll("\\s+","").contains(("<naming>\n" +
                "<designation>Parenchymal Imaging</designation>\n" +
                "<definition>\n" +
                "Contains data elements collected when an imaging study is performed to measure parenchyma; data recorded attempt to divide the strokes into ischemic or hemorrhagic subtypes, as distinction of hemorrhage versus infarction is the initial critical branch point in acute stroke triage. (Examples of CDEs included: Acute infarcts present; Planimetic acute ischemic lesion volume; and Acute hematoma present)\n" +
                "</definition>\n" +
                "</naming>").replaceAll("\\s+", "")));
    }

}