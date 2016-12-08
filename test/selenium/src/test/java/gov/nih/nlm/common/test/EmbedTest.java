package gov.nih.nlm.common.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class EmbedTest extends NlmCdeBaseTest {

    @Test
    public void embedNinds() {
        mustBeLoggedInAs(ninds_username, password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Account Management"));
        clickElement(By.id("embeddingTab"));
        clickElement(By.id("NINDS_addEmbed"));

        findElement(By.id("embedName")).sendKeys("Main NINDS Embed");

        clickElement(By.id("cde.primaryDefinition"));
        findElement(By.id("cde.primaryDefinition.label")).sendKeys("Description");
        findElement(By.id("cde.primaryDefinition.style")).sendKeys("width: 200px");

        clickElement(By.id("addName"));
        findElement(By.id("name.0.contextName")).sendKeys("Question Text");
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
        closeAlert();

        clickElement(By.id("NINDS.0.editEmbed"));
        clickElement(By.id("previewEnabled"));

        scrollTo(2500);
        driver.switchTo().frame("previewFrame");

        findElement(By.id("search.submit")).click();
        textPresent("Ethnicity");
        textPresent("results (");

        hangon(1);

        Assert.assertEquals(findElements(By.cssSelector("#gridList tbody tr")).size(), 6);

        List<WebElement> ths = findElements(By.cssSelector("#gridList th"));
        Assert.assertEquals(ths.size(), 9);

        Assert.assertEquals(ths.get(0).getText(), "Name");
        Assert.assertEquals(ths.get(1).getText(), "CDE ID");
        Assert.assertEquals(ths.get(2).getText(), "Version");
        Assert.assertEquals(ths.get(3).getText(), "Variable Name");
        Assert.assertEquals(ths.get(4).getText(), "Question");
        Assert.assertEquals(ths.get(5).getText(), "Description");
        Assert.assertEquals(ths.get(6).getText(), "Status");
        Assert.assertTrue(ths.get(7).getText().startsWith("Classification ("));
        Assert.assertTrue(ths.get(8).getText().startsWith("Forms ("));

        textPresent("Ethnicity USA category");
        textPresent("C00020");
        textPresent("Category of ethnicity the ");
        textPresent("Qualified");
        textPresent("Amyotrophic Lateral Sclerosis;Classification;Core");
        textPresent("Demographics");

        driver.switchTo().defaultContent();
        goHome();
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Account Management")).click();
        findElement(By.id("embeddingTab")).click();
        findElement(By.id("removeEmbed-0")).click();
        findElement(By.id("confirmRemoveEmbed-0")).click();
        textPresent("Removed");

    }

}
