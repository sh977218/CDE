package gov.nih.nlm.botHtml;

import gov.nih.nlm.system.NlmCdeBaseTest;
import gov.nih.nlm.system.SelectUserAgent;
import org.testng.Assert;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.get;

public class BotHtmlTest extends NlmCdeBaseTest {

    @Test
    @SelectUserAgent()
    public void botHomeHtml() {
        driver.get(baseUrl + "/home");
        textPresent("Browse CDEs");
        textPresent("Browse Forms");
    }

    @Test
    @SelectUserAgent()
    public void botCdeSearchHtml() {
        driver.get(baseUrl + "/cde/search");
        textPresent("Global Rare Diseases Patient Registry Data Repository");

        driver.get(baseUrl + "/cde/search?selectedOrg=NICHD");
        textPresent("Behavioral Assessment Bayley Scales of Infant Development java.lang.String");

    }

    @Test
    @SelectUserAgent()
    public void botFormSearchHtml() {
        driver.get(baseUrl + "/form/search");
        textPresent("Patient Reported Outcomes Measurement Information System");

        driver.get(baseUrl + "/form/search?selectedOrg=NIDA");
        textPresent("PHQ-2");

    }

    @Test
    @SelectUserAgent()
    public void botDeViewHtml() {
        driver.get(baseUrl + "/deView?tinyId=QJxhjQVkke");
        textPresent("Patient Health Questionnaire (PHQ-9) Last Two Weeks How Often Little Interest or Pleasure in Doing Things Score 4 Point Scale");
        textPresent("Value List");
        textPresent("A subjective answer of non-agreement.");
        textPresent("PHQ9_LTL_INTEREST_SC");
        textPresent("3811418");
    }

    @Test
    @SelectUserAgent()
    public void botFormViewHtml() {
        driver.get(baseUrl + "/formView?tinyId=mJsGoMU1m");
        textPresent("PHQ-9 quick depression assessment panel [Reported.PHQ]");
        textPresent("Description: Kroenke K, Spitzer RL, Williams JB.");
        textPresent("PHQ-9 quick depression assessment Pnl");
        textPresent("44249-1");
    }

    @Test
    public void siteMap() {
        Assert.assertTrue(get(baseUrl + "/sitemap.txt").asString().contains("/deView?tinyId=rkh4tQrOgTw"));
    }

}
