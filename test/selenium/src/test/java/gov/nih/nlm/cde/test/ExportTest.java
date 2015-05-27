package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.concurrent.TimeUnit;

import static com.jayway.restassured.RestAssured.*;

public class ExportTest extends NlmCdeBaseTest {
    @Test
    public void cdeExport() {

        String query = "{\"query\":{\"size\":20,\"query\":{\"bool\":{\"must_not\":[{\"term\":{\"registrationState.registrationStatus\":\"Retired\"}},{\"term\":{\"registrationState.administrativeStatus\":\"retire\"}},{\"term\":{\"archived\":\"true\"}},{\"term\":{\"isFork\":\"true\"}}],\"must\":[{\"dis_max\":{\"queries\":[{\"function_score\":{\"script_score\":{\"script\":\"(_score + (6 - doc['registrationState.registrationStatusSortOrder'].value)) * doc['classificationBoost'].value\"}}}]}}]}},\"aggregations\":{\"lowRegStatusOrCurator_filter\":{\"filter\":{\"or\":[{\"range\":{\"registrationState.registrationStatusSortOrder\":{\"lte\":3}}}]},\"aggs\":{\"orgs\":{\"terms\":{\"field\":\"classification.stewardOrg.name\",\"size\":40,\"order\":{\"_term\":\"desc\"}}}}},\"statuses\":{\"terms\":{\"field\":\"registrationState.registrationStatus\"},\"aggregations\":{\"lowRegStatusOrCurator_filter\":{\"filter\":{\"or\":[{\"range\":{\"registrationState.registrationStatusSortOrder\":{\"lte\":3}}}]}}}}},\"filter\":{\"and\":[{\"or\":[{\"term\":{\"registrationState.registrationStatus\":\"Preferred Standard\"}},{\"term\":{\"registrationState.registrationStatus\":\"Standard\"}},{\"term\":{\"registrationState.registrationStatus\":\"Qualified\"}}]},{\"or\":[{\"range\":{\"registrationState.registrationStatusSortOrder\":{\"lte\":3}}}]}]},\"from\":null,\"highlight\":{\"order\":\"score\",\"pre_tags\":[\"<strong>\"],\"post_tags\":[\"</strong>\"],\"fields\":{\"stewardOrgCopy.name\":{},\"primaryNameCopy\":{},\"primaryDefinitionCopy\":{},\"naming.designation\":{},\"naming.definition\":{},\"dataElementConcept.concepts.name\":{},\"dataElementConcept.concepts.origin\":{},\"dataElementConcept.concepts.originId\":{},\"property.concepts.name\":{},\"property.concepts.origin\":{},\"property.concepts.originId\":{},\"objectClass.concepts.name\":{},\"objectClass.concepts.origin\":{},\"objectClass.concepts.originId\":{},\"valueDomain.datatype\":{},\"flatProperties\":{},\"flatIds\":{},\"classification.stewardOrg.name\":{},\"classification.elements.name\":{},\"classification.elements.elements.name\":{},\"classification.elements.elements.elements.name\":{}}}}}";

        String response = given().contentType("application/json; charset=UTF-16").body(query).when().post(baseUrl + "/elasticSearchExport/cde").asString();//.then().assertThat().contentType(ContentType.JSON);

        try {
            Assert.assertTrue(response.contains("\"Ethnic Group Category Text\",\"Ethnicity; Patient Ethnicity; Ethnicity; Newborn's Ethnicity\",\"Value List\",\"Not Hispanic or Latino; Hispanic or Latino; Unknown; Not reported\",\"caDSR: 2192217 v2\",\"caBIG\",\"Standard\",\"\",\"NIDCR; caBIG; CCR; CTEP; NICHD; AECC; LCC; USC/NCCC; NHC-NCI; PBTC; CITN; OHSU Knight; DCP; DCI; Training\","));
        }catch(Exception e) {
            System.out.print(response);
        }

        goToSearch("cde");
        findElement(By.id("ftsearch-input")).sendKeys("\"Parkinson's\"");
        findElement(By.id("exportSearch")).click();
        textPresent("export is being generated");
        closeAlert();
        findElement(By.id("exportSearch")).click();
        textPresent("export is being generated");
        closeAlert();
        textPresent("server is busy processing");
        closeAlert();
        wait.withTimeout(10, TimeUnit.SECONDS);
        boolean done = false;
        for (int i=0; !done && i < 10; i++) {
            try {
                textPresent("Export downloaded.");
                done = true;
            } catch (TimeoutException e) {System.out.println("No export after : " + 10 * i + "seconds");}
        }
        wait.withTimeout(defaultTimeout, TimeUnit.SECONDS);
        closeAlert();
        if (!done) throw new TimeoutException("Export was too slow.");
    }
}
