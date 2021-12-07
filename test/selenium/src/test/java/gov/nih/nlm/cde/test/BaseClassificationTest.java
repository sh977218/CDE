package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;

import java.util.Arrays;
import java.util.List;

public class BaseClassificationTest extends NlmCdeBaseTest {
    public void addClassificationMethod(String[] categories) {
        clickElement(By.id("openClassificationModalBtn"));
        addClassificationMethodDo(categories);
    }

    private void addClassificationMethodDo(String[] categories) {
        new Select(findElement(By.id("selectClassificationOrg"))).selectByVisibleText(categories[0]);
        String[] cats = Arrays.copyOfRange(categories, 1, categories.length);
        for (int i = 0; i < cats.length - 1; i++) {
            classifyToggle(Arrays.copyOfRange(cats, 0, i + 1));
        }
        classifySubmit(cats, null);
    }

    protected void fillOutBasicCreateFields(String name, String definition, String org, String classification, String subClassification) {
        hoverOverElement(findElement(By.id("createEltLink")));
        clickElement(By.id("createCDELink"));
        textPresent("Create Data Element");
        findElement(By.name("eltName")).sendKeys(name);
        findElement(By.name("eltDefinition")).sendKeys(definition);
        new Select(findElement(By.id("eltStewardOrgName"))).selectByVisibleText(org);
        hangon(1);
        addClassificationMethod(new String[]{org, classification, subClassification});
    }

    protected void expandOrgClassification(String orgName) {
        clickElement(By.xpath("//*[@id='" + orgName + "']//preceding-sibling::button[//mat-icon[normalize-space() = 'chevron_right']]"));
        hangon(2);
    }

    protected void expandOrgClassificationUnderPath(String[] categories) {
        if (categories.length > 0) {
            for (int i = 0; i < categories.length; i++) {
                String[] _categories = Arrays.copyOfRange(categories, 0, i + 1);
                String id = String.join(",", _categories);
                clickElement(By.xpath("//*[@id='" + id + "']//preceding-sibling::button[//mat-icon[contains(.,'chevron_right')]]"));
            }
        }
    }

    protected void selectOrgClassification(String orgName) {
        clickElement(By.id("selectOrgMatSelect"));
        selectMatDropdownByText(orgName);
    }

    protected void addClassificationUnderPath(String[] categories, String classificationName) {
        if (categories.length > 0) {
            for (int i = 0; i < categories.length; i++) {
                String[] _categories = Arrays.copyOfRange(categories, 0, i + 1);
                String expandIconId = String.join(",", _categories);
                clickElement(By.xpath("//*[@id='" + expandIconId + "']//preceding-sibling::button"));
            }
            By dropMenuIconBy = By.xpath("//*[@id='" + String.join(",", categories) + "']//following-sibling::button");
            clickElement(dropMenuIconBy);
            clickElement(By.xpath("//button[mat-icon[normalize-space() = 'subdirectory_arrow_left']]"));
        } else {
            clickElement(By.id("addClassificationUnderRoot"));
        }
        textPresent("Add a new classification under path:");
        findElement(By.id("addChildClassifInput")).sendKeys(classificationName);
        hangon(5);
        clickElement(By.id("confirmAddChildClassificationBtn"));
        checkAlert("Classification added");
    }

    protected void deleteClassificationUnderPath(String[] categories, String classificationName) {
        for (int i = 0; i < categories.length; i++) {
            String[] _categories = Arrays.copyOfRange(categories, 0, i + 1);
            String expandIconId = String.join(",", _categories);
            clickElement(By.xpath("//*[@id='" + expandIconId + "']//preceding-sibling::button"));
        }
        By dropMenuIconBy = By.xpath("//*[@id='" + String.join(",", categories) + "']//following-sibling::button");
        clickElement(dropMenuIconBy);
        clickElement(By.xpath("//button[mat-icon[normalize-space() = 'delete_outline']]"));
        findElement(By.id("removeClassificationUserTyped")).sendKeys(classificationName);
        hangon(2);
        clickElement(By.id("confirmDeleteClassificationBtn"));
        checkAlert("Deleting in progress.");
        try {
            checkAlert("Classification Deleted");
            closeAlert();
        } catch (WebDriverException e) {
            checkAlert("Classification Deleted");
        }
    }

    protected void renameClassificationUnderPath(String[] categories, String classificationName) {
        for (int i = 0; i < categories.length; i++) {
            String[] _categories = Arrays.copyOfRange(categories, 0, i + 1);
            String expandIconId = String.join(",", _categories);
            clickElement(By.xpath("//*[@id='" + expandIconId + "']//preceding-sibling::button"));
        }
        By dropMenuIconBy = By.xpath("//*[@id='" + String.join(",", categories) + "']//following-sibling::button");
        clickElement(dropMenuIconBy);
        clickElement(By.xpath("//button[mat-icon[normalize-space() = 'edit']]"));
        findElement(By.id("newClassificationName")).sendKeys(classificationName);
        hangon(2);
        clickElement(By.id("confirmRenameClassificationBtn"));
        checkAlert("Renaming in progress.");
        try {
            textPresent("Classification Renamed");
            closeAlert();
        } catch (WebDriverException e) {
            checkAlert("Classification Renamed");
        }
    }

    protected void reclassifyClassificationUnderPath(String org, String[] categories, String classificationName, String[] newCategories) {
        for (int i = 0; i < categories.length; i++) {
            String[] _categories = Arrays.copyOfRange(categories, 0, i + 1);
            String expandIconId = String.join(",", _categories);
            clickElement(By.xpath("//*[@id='" + expandIconId + "']//preceding-sibling::button"));
        }
        By dropMenuIconBy = By.xpath("//*[@id='" + String.join(",", categories) + "']//following-sibling::button");
        clickElement(dropMenuIconBy);
        clickElement(By.xpath("//button[mat-icon[normalize-space() = 'transform']]"));
        textPresent("Classify CDEs in Bulk");
        new Select(findElement(By.id("selectClassificationOrg"))).selectByVisibleText(org);
        classifySubmit(newCategories, "");
        checkAlert("Reclassifying in progress.");
        try {
            textPresent("Classification Reclassified.");
            closeAlert();
        } catch (WebDriverException e) {
            checkAlert("Classification Reclassified.");
        }
    }

}
