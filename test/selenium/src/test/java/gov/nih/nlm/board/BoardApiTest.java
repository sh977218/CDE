package gov.nih.nlm.board;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.get;

public class BoardApiTest extends NlmCdeBaseTest {

    @Test
    public void pageTooFar() {
        get(baseUrl + "/server/board/abc/0/1000").then().statusCode(400);
    }
}
