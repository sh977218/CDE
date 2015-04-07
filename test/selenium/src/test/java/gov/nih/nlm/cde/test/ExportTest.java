package gov.nih.nlm.cde.test;
import static com.jayway.restassured.RestAssured.*;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class ExportTest extends NlmCdeBaseTest {
    @Test
    public void cdeExport() {
        goToSearch("cde");
        findElement(By.id("exportSearch")).click();
        String query = "{\"query\":{\"size\":20,\"query\":{\"bool\":{\"must_not\":[{\"term\":{\"registrationState.registrationStatus\":\"Retired\"}},{\"term\":{\"registrationState.administrativeStatus\":\"retire\"}},{\"term\":{\"archived\":\"true\"}},{\"term\":{\"isFork\":\"true\"}}],\"must\":[{\"dis_max\":{\"queries\":[{\"function_score\":{\"script_score\":{\"script\":\"(_score + (6 - doc['registrationState.registrationStatusSortOrder'].value)) * doc['classificationBoost'].value\"}}}]}}]}},\"aggregations\":{\"lowRegStatusOrCurator_filter\":{\"filter\":{\"or\":[{\"range\":{\"registrationState.registrationStatusSortOrder\":{\"lte\":3}}}]},\"aggs\":{\"orgs\":{\"terms\":{\"field\":\"classification.stewardOrg.name\",\"size\":40,\"order\":{\"_term\":\"desc\"}}}}},\"statuses\":{\"terms\":{\"field\":\"registrationState.registrationStatus\"},\"aggregations\":{\"lowRegStatusOrCurator_filter\":{\"filter\":{\"or\":[{\"range\":{\"registrationState.registrationStatusSortOrder\":{\"lte\":3}}}]}}}}},\"filter\":{\"and\":[{\"or\":[{\"term\":{\"registrationState.registrationStatus\":\"Preferred Standard\"}},{\"term\":{\"registrationState.registrationStatus\":\"Standard\"}},{\"term\":{\"registrationState.registrationStatus\":\"Qualified\"}}]},{\"or\":[{\"range\":{\"registrationState.registrationStatusSortOrder\":{\"lte\":3}}}]}]},\"from\":null,\"highlight\":{\"order\":\"score\",\"pre_tags\":[\"<strong>\"],\"post_tags\":[\"</strong>\"],\"fields\":{\"stewardOrgCopy.name\":{},\"primaryNameCopy\":{},\"primaryDefinitionCopy\":{},\"naming.designation\":{},\"naming.definition\":{},\"dataElementConcept.concepts.name\":{},\"dataElementConcept.concepts.origin\":{},\"dataElementConcept.concepts.originId\":{},\"property.concepts.name\":{},\"property.concepts.origin\":{},\"property.concepts.originId\":{},\"objectClass.concepts.name\":{},\"objectClass.concepts.origin\":{},\"objectClass.concepts.originId\":{},\"valueDomain.datatype\":{},\"flatProperties\":{},\"flatIds\":{},\"classification.stewardOrg.name\":{},\"classification.elements.name\":{},\"classification.elements.elements.name\":{},\"classification.elements.elements.elements.name\":{}}}}}";
        String response = given().contentType("application/json; charset=UTF-16").body(query).when().post(baseUrl + "/elasticSearchExport/cde").asString();//.then().assertThat().contentType(ContentType.JSON);
        Assert.assertTrue( response.contains("\"Ethnic Group Category Text\",\"Ethnicity; Patient Ethnicity; Ethnicity; Newborn's Ethnicity\",\"Value List\",\"Not Hispanic or Latino; Hispanic or Latino; Unknown; Not reported\",\"caDSR: 2192217 v2\",\"caBIG\",\"Standard\",\"\",\"NIDCR; caBIG; CCR; CTEP; NICHD; AECC; LCC; USC/NCCC; NHC-NCI; PBTC; CITN; OHSU Knight; DCP; DCI; Training\",") );
    }
}
