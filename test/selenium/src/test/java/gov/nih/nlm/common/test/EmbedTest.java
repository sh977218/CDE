package gov.nih.nlm.common.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import io.restassured.http.Cookie;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

import static io.restassured.RestAssured.given;

public class EmbedTest extends NlmCdeBaseTest {

    @Test
    public void embedNinds() {
        mustBeLoggedInAs(ninds_username, password);
        goToEmbedding();
        clickElement(By.id("NINDS_addEmbed"));

        findElement(By.id("embedName")).sendKeys("Main NINDS Embed");

        clickElement(By.id("cde.primaryDefinition"));
        findElement(By.id("cde.primaryDefinition.label")).sendKeys("Description");
        findElement(By.id("cde.primaryDefinition.style")).sendKeys("width: 200px");

        clickElement(By.id("addName"));
        findElement(By.id("name.0.tags")).sendKeys("Question Text");
        findElement(By.id("name.0.label")).sendKeys("Question");
        clickElement(By.id("addName"));
        clickElement(By.id("name.1.remove"));

        clickElement(By.id("addId"));
        findElement(By.id("id.0.source")).sendKeys("NINDS");
        findElement(By.id("id.0.idLabel")).clear();
        findElement(By.id("id.0.idLabel")).sendKeys("CDE ID");
        clickElement(By.id("id.0.sourceVersion"));
        findElement(By.id("id.0.versionLabel")).sendKeys("Version");

        clickElement(By.id("addId"));
        findElement(By.id("id.1.source")).sendKeys("NINDS Variable");
        findElement(By.id("id.1.idLabel")).clear();
        findElement(By.id("id.1.idLabel")).sendKeys("Variable Name");

        clickElement(By.id("addId"));
        clickElement(By.id("id.2.remove"));

        clickElement(By.id("addClassification"));
        findElement(By.id("classif.0.label")).sendKeys("Classification");
        findElement(By.id("classif.0.startsWith")).sendKeys("NINDS;Disease;");
        findElement(By.id("classif.0.exclude")).sendKeys("^NINDS;Disease;.+;Domain");
        clickElement(By.id("classif.0.selectedOnly"));

        clickElement(By.id("addClassification"));
        clickElement(By.id("classif.1.remove"));

        clickElement(By.id("cde.linkedForms"));
        findElement(By.id("cde.linkedForms.label")).sendKeys("Forms");

        findElement(By.id("cde.pageSize")).clear();
        findElement(By.id("cde.pageSize")).sendKeys("6");

        clickElement(By.id("cde.regStatus"));
        findElement(By.id("cde.registrationStatus.label")).sendKeys("Status");

        clickElement(By.id("saveEmbed"));
        checkAlert("Saved.");

        clickElement(By.id("NINDS.0.editEmbed"));
        clickElement(By.id("previewEnabled"));

        scrollTo(2600);
        driver.switchTo().frame("previewFrame");
        // https://bugs.chromium.org/p/chromedriver/issues/detail?id=2198is
        hangon(2);
        findElement(By.id("poweredByNihCde"));
        findElement(By.id("ftsearch-input")).sendKeys("+USA +Ethnicity +category");
        wait.until(ExpectedConditions.textToBePresentInElementValue(By.id("ftsearch-input"), "+USA +Ethnicity +category"));
        findElement(By.id("search.submit")).click();

        textPresent("Ethnicity USA category");
        textPresent("results (");

        hangon(1);

        Assert.assertEquals(findElements(By.cssSelector("#gridList tbody tr")).size(), 6);

        List<WebElement> ths = findElements(By.cssSelector("#gridList th"));
        Assert.assertEquals(ths.size(), 10);

        Assert.assertEquals(ths.get(0).getText(), "Name");
        Assert.assertEquals(ths.get(1).getText(), "Permissible Values");
        Assert.assertEquals(ths.get(2).getText(), "CDE ID");
        Assert.assertEquals(ths.get(3).getText(), "Version");
        Assert.assertEquals(ths.get(4).getText(), "Variable Name");
        Assert.assertEquals(ths.get(5).getText(), "Question");
        Assert.assertEquals(ths.get(6).getText(), "Description");
        Assert.assertEquals(ths.get(7).getText(), "Status");
        Assert.assertTrue(ths.get(8).getText().startsWith("Classification ("));
        Assert.assertTrue(ths.get(9).getText().startsWith("Forms ("));

        textPresent("Ethnicity USA category");
        textPresent("C00020");
        textPresent("Category of ethnicity the ");
        textPresent("Qualified");
        textPresent("Amyotrophic Lateral Sclerosis;Classification;Core");
        textPresent("Demographics");

        driver.switchTo().defaultContent();

        clickElement(By.id("saveEmbed"));
        checkAlert("Saved.");

        goHome();
        goToEmbedding();
        clickElement(By.id("removeEmbed-0"));
        try {
            findElement(By.id("confirmRemoveEmbed-0")).click();
        } catch (TimeoutException e) {
            driver.switchTo().defaultContent();
            goHome();
            goToEmbedding();
            clickElement(By.id("removeEmbed-0"));
            findElement(By.id("confirmRemoveEmbed-0")).click();
        }
        textPresent("Removed");
    }

    @Test
    public void embedAuthErrors() {
        mustBeLoggedInAs(reguser_username, password);
        Cookie myCookie = getCurrentCookie();

        String wrongID = "5ddbeb268c5d2217b4282159";
        given().cookie(myCookie).delete(baseUrl + "/server/embed/" + wrongID).then().statusCode(422);
        given().cookie(myCookie).get(baseUrl + "/server/embed/" + wrongID).then().statusCode(404);

        given().cookie(myCookie).delete(baseUrl + "/server/embed/5ddbeb268c5d2217b4282158").then().statusCode(403);


    }

}
