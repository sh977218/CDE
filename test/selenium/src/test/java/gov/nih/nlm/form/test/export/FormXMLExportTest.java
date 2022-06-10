package gov.nih.nlm.form.test.export;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.get;

public class FormXMLExportTest extends NlmCdeBaseTest {

    @Test
    public void formXmlExport() {
        String form = "Parenchymal Imaging";
        mustBeLoggedInAs(nlm_username, nlm_password); // TODO: download as tab, reguser_username
        goToFormByName(form);
        downloadAsTab();
        hangon(1);
        clickElement(By.id("export"));
        String url = findElement(By.xpath("//a[@mat-menu-item][contains(.,'NIH/CDE Schema XML preview')]")).getAttribute("href");
        String response = get(url).asString().replaceAll("\\s+", "");

        String shouldContain = ("<designations>\n" +
                "<designation>Parenchymal Imaging</designation>\n" +
                "</designations>").replaceAll("\\s+", "");
        if (!response.contains(shouldContain)) {
            Assert.fail("response:\n" + response + "\nshouldContain:\n" + shouldContain);
        }
        String shouldContain1 = ("<designations>\n" +
                "<definition>Contains data elements collected when an imaging study is performed to measure parenchyma; data recorded attempt to divide the strokes into ischemic or hemorrhagic subtypes, as distinction of hemorrhage versus infarction is the initial critical branch point in acute stroke triage. (Examples of CDEs included: Acute infarcts present; Planimetic acute ischemic lesion volume; and Acute hematoma present)\n" +
                "</definition>").replaceAll("\\s+", "");
        if (!response.contains(shouldContain)) {
            Assert.fail("response:\n" + response + "\nshouldContain1:\n" + shouldContain1);
        }


        String resp = get(baseUrl + "/api/form/sdsflijkfsd?type=xml").asString();
        Assert.assertTrue(resp.contains("ctepCurator"));
    }

    @Test
    public void getFormNih() {
        String resp = get(baseUrl + "/server/form/byId/58caa836453619ab06d913b3?type=xml").asString();
        Assert.assertTrue(resp.contains("XJzVz1TZDe"));

    }

}
