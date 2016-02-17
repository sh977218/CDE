package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

import static com.jayway.restassured.RestAssured.get;

public class ClassificationTest extends BaseClassificationTest {

	@Test
	public void addClassification() {
		mustBeLoggedInAs("classMgtUser", "pass");
		goToCdeByName("Surgical Procedure Other Anatomic Site Performed Indicator");
		findElement(By.linkText("Classification")).click();
		addClassificationMethod(new String[] { "NINDS", "Disease",
				"Myasthenia Gravis", "Classification", "Supplemental" });
		checkRecentlyUsedClassifications(new String[] { "NINDS", "Disease",
				"Myasthenia Gravis", "Classification", "Supplemental" });
		hangon(1);
		addClassificationMethod(new String[] { "NINDS", "Domain",
				"Treatment/Intervention Data", "Therapies" });
		findElement(By.id("addClassification")).click();
		List<WebElement> priorClassifs = driver.findElements(By
				.xpath("//div[ol]"));
		for (WebElement prior : priorClassifs) {
			if (prior.getText().contains("Myasthenia Gravis")
					&& prior.getText().contains("Supplemental")) {
				prior.findElement(By.tagName("button")).click();
				textPresent("Classification Already Exists");
				closeAlert();
			}
		}
		findElement(By.xpath("//button[text() = 'Close']")).click();
		modalGone();

		openClassificationAudit("NINDS > Disease > Myasthenia Gravis > Classification > Supplemental");
		textPresent("classMgtUser");
		textPresent("Surgical Procedure Other Anatomic Site Performed Indicator");
		textPresent("Add NINDS > Disease > Myasthenia Gravis > Classification > Supplemental");
	}

    @Test(dependsOnMethods = {"addClassification"})
    public void modifiedSinceAPI() {
        String response = get(baseUrl + "/api/cde/modifiedElements?from=2016-01-01").asString();
        Assert.assertFalse(response.contains("Invalid"), "Actual: " + response);
        Assert.assertTrue(response.contains("cGx6UmQnY8G"), "Actual: " + response);
    }

	private void removeClassificationMethod(String[] categories) {
		String selector = "";
		for (int i = 0; i < categories.length; i++) {
			selector += categories[i];
			if (i < categories.length - 1)
				selector += ",";
		}
		textPresent(categories[categories.length - 1],
				By.id("classification-" + selector));
		deleteClassification("classification-" + selector);
		driver.navigate().refresh();
		findElement(By.linkText("Classification")).click();
		Assert.assertTrue(checkElementDoesNotExistByCSS("[id='classification-" + selector + "']"));
	}

	@Test
	public void deleteClassification() {
		mustBeLoggedInAs(classificationMgtUser_username, password);
		goToCdeByName("Spectroscopy geometry location not applicable indicator");
		findElement(By.linkText("Classification")).click();
		findElement(By.id("classification-Domain,Assessments and Examinations,Imaging Diagnostics"));
		removeClassificationMethod(new String[] { "Domain","Assessments and Examinations", "Imaging Diagnostics" });
        wait.until(ExpectedConditions.not(ExpectedConditions.
                presenceOfAllElementsLocatedBy(By.id(
                        "classification-Domain,Assessments and Examinations,Imaging Diagnostics"))));
		findElement(By.id("classification-Assessments and Examinations"));
		removeClassificationMethod(new String[] { "Disease", "Myasthenia Gravis"});
		textNotPresent("Myasthenia Gravis");
		openClassificationAudit("NINDS > Disease > Myasthenia Gravis");
		textPresent("classMgtUser");
		textPresent("Delete NINDS > Disease > Myasthenia Gravis");
	}

	@Test
	public void classificationLink() {
        goToCdeByName("Spectroscopy water signal removal filter text");
        findElement(By.linkText("Classification")).click();
		findElement(
				By.cssSelector("[id='classification-Domain,Assessments and Examinations,Imaging Diagnostics'] .name"))
				.click();
        showSearchFilters();
		textPresent("Classification");
        textPresent("NINDS (12");
		textPresent("Imaging Diagnostics");
	}

	// Feature is Temporarily Disabled
	// @Test
//	public void classifyEntireSearch() {
//		mustBeLoggedInAs(ninds_username, password);
//		goToCdeSearch();
//		findElement(By.id("li-blank-AECC")).click();
//		textPresent("NCI Standard Template CDEs (7)");
//		findElement(By.id("classifyAll")).click();
//		findElement(By.xpath("//span[text()='Population']")).click();
//		findElement(By.xpath("//div[@id='addClassification-Adult']//button"))
//				.click();
//		textPresent("Search result classified");
//		goToCdeByName("Noncompliant Reason Text");
//		findElement(By.linkText("Classification")).click();
//		textPresent("NINDS");
//		textPresent("Population");
//		textPresent("Adult");
//		goToCdeByName("Adverse Event Ongoing Event Indicator");
//		findElement(By.linkText("Classification")).click();
//		textPresent("NINDS");
//		textPresent("Population");
//		textPresent("Adult");
//	}

}
