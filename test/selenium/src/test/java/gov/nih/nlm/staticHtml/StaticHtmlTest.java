package gov.nih.nlm.staticHtml;

import gov.nih.nlm.system.NlmCdeBaseTest;
import gov.nih.nlm.system.SelectUserAgent;
import org.testng.annotations.Test;

public class StaticHtmlTest extends NlmCdeBaseTest {

    @Test
    @SelectUserAgent()
    public void staticHomeHtml() {
        goHome();
        textPresent("Browse CDEs");
        textPresent("Browse Forms");
    }

    @Test
    @SelectUserAgent()
    public void staticCdeSearchHtml() {
        driver.get(baseUrl + "/cde/search");
        textPresent("Cancer Therapy Evaluation Program");
    }

    @Test
    @SelectUserAgent()
    public void staticFormSearchHtml() {
        driver.get(baseUrl + "/form/search");
        textPresent("Cancer Biomedical Informatics Grid");
    }

    @Test
    @SelectUserAgent()
    public void staticDeViewHtml() {
        driver.get(baseUrl + "/devView?tinyId=QJxhjQVkke");
        textPresent("Patient Health Questionnaire (PHQ-9) Last Two Weeks How Often Little Interest or Pleasure in Doing Things Score 4 Point Scale");
        textPresent("Value List");
        textPresent("A subjective answer of non-agreement.");
        textPresent("PHQ9_LTL_INTEREST_SC");
        textPresent("3811418");
    }

    @Test
    @SelectUserAgent()
    public void staticFormViewHtml() {
        driver.get(baseUrl + "/formView?tinyId=mJsGoMU1m");
        textPresent("PHQ-9 quick depression assessment panel [Reported.PHQ]");
        textPresent("Description: Kroenke K, Spitzer RL, Williams JB.");
        textPresent("PHQ-9 quick depression assessment Pnl\t");
        textPresent("44249-1");
    }
}
