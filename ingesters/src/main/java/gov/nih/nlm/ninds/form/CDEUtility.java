package gov.nih.nlm.ninds.form;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

import java.util.ArrayList;
import java.util.List;

public class CDEUtility {
    public CDEUtility() {
    }

    public void checkDataQuality(MongoOperations mongoOperation, String url) {
        List dataTypeList = mongoOperation.getCollection("ninds").distinct("cdes.dataType");
        if (dataTypeList.size() > 4) {
            System.out.println("data type is not good. size: " + dataTypeList.size() + " url:" + url);
            System.exit(1);
        }
        List inputRestrictionsList = mongoOperation.getCollection("ninds").distinct("cdes.inputRestrictions");
        if (inputRestrictionsList.size() > 3) {
            System.out.println("inputRestrictionsList is not good. size: " + inputRestrictionsList.size() + " url:" + url);
            System.exit(1);
        }
        List diseaseNameList = mongoOperation.getCollection("ninds").distinct("diseaseName");
        if (diseaseNameList.size() > 19) {
            System.out.println("diseaseName is not good. size: " + diseaseNameList.size() + " url:" + url);
            System.exit(1);
        }
        Query searchEmptyDiseaseFormQuery = new Query(Criteria.where("formId").is(""));
        MyForm emptyDiseaseForm = mongoOperation.findOne(searchEmptyDiseaseFormQuery, MyForm.class);
        if (emptyDiseaseForm != null) {
            System.out.println("some form has empty disease name.");
            System.exit(1);
        }
    }

    public String cleanFormName(String s) {
        String result = s.replace("\"", " ").replace(" - Paper version", " Paper version").replace("©", "").replace("™", "").trim();
        String[] badStrings = {
                "For additional information please visit NINDS-Coriell",
                "Note: Also refer to Outcomes and End Points for additional measures recommended for assessing neurological impairment and functional status.",
                "The CDEs for this CRF Module are included directly below for the individual RFQ CRFs."};
        for (String badString : badStrings) {
            result = result.replace(badString, "").trim();
        }
        return result;
    }

    public String cleanSubDomain(String s) {
        String result = s;
        String[] badStrings = {
                "The NINDS strongly encourages researchers to use these NIH-developed materials for NINDS-sponsored research, when appropriate. Utilization of these resources will enable greater consistency for NINDS-sponsored research studies. These tools are free of charge.",
                "See \"CRF Search\" to find all Imaging forms under Subdomain option.",
                "See \"CRF Search\" to find all Non-Imaging forms under Subdomain option.",
                "See \"CRF Search\" to find Surgeries and Other Procedures forms under Subdomain option.",
                "See \"CRF Search\" to find all History of Disease/Injury Event forms under Subdomain option.",
                "See \"CRF Search\" to find all Classification forms under Subdomain option.",
                "See \"CRF Search\" to find all Second Insults forms under Subdomain option.",
                "See \"CRF Search\" to find all Discharge forms under Subdomain option.",
                "Note: The General CDE Standards contain additional useful CRF Modules and CDEs for this sub-domain.",
                "Note: Also refer to Outcomes and End Points for additional measures recommended for assessing neurological impairment and functional status.",
        };
        for (String badString : badStrings) {
            result = result.replace(badString, "").trim();
        }
        return result;
    }

    public void getCdesList(WebDriver driver, MyForm form) {
        String selector = "//tbody[tr/td/div[text() = 'CDE ID']]/tr";
        List<WebElement> trs = driver.findElements(By.xpath(selector));
        for (int i = 2; i < trs.size(); i++) {
            WebElement tr = trs.get(i);
            List<WebElement> tds = tr.findElements(By.cssSelector("td"));
            int index = 1;
            Cde cde = new Cde();
            int noise = 0;
            for (WebElement td : tds) {
                String text = td.getText().replace("\"", " ").trim();
                if (index == 1) {
                    cde.cdeId = text;
                }
                if (index == 2) {
                    cde.cdeName = text;
                }
                if (index == 3) {
                    cde.variableName = text;
                }
                if (index == 4) {
                    cde.definitionDescription = text;
                }
                if (index == 5) {
                    cde.questionText = text;
                }
                if (index == 6) {
                    cde.permissibleValue = text;
                }
                if (index == 7) {
                    cde.permissibleDescription = text;
                }
                if (index == 8) {
                    cde.dataType = text;
                }
                if (index == 9) {
                    cde.instruction = text;
                }
                if (index == 10) {
                    cde.reference = text;
                }
                if (index == 11) {
                    cde.population = text;
                }
                if (index == 12) {
                    cde.classification = text;
                }
                if (index == 13) {
                    cde.versionNum = text;
                }
                if (index == 14) {
                    cde.versionDate = text;
                }
                if (index == 15) {
                    cde.aliasesForVariableName = text;
                }
                if (index == 16) {
                    cde.crfModuleGuideline = text;
                }
                if (index == 17) {
                    List<WebElement> table = td.findElements(By.cssSelector("table"));
                    if (table.size() > 0) {
                        cde.copyRight = "true";
                        noise = 1;
                    }
                }
                if (index == 18 + noise) {
                    cde.subDomain = text;
                    form.setSubDomainName(text);
                }
                if (index == 19 + noise) {
                    cde.domain = text;
                    form.setDomainName(text);
                }
                if (index == 20 + noise) {
                    cde.previousTitle = text;
                }
                if (index == 21 + noise) {
                    cde.size = text;
                }
                if (index == 22 + noise) {
                    cde.inputRestrictions = text;
                }
                if (index == 23 + noise) {
                    cde.minValue = text;
                }
                if (index == 24 + noise) {
                    cde.maxValue = text;
                }
                if (index == 25 + noise) {
                    cde.measurementType = text;
                }
                if (index == 26 + noise) {
                    cde.loincId = text;
                }
                if (index == 27 + noise) {
                    cde.snomed = text;
                }
                if (index == 28 + noise) {
                    cde.cadsrId = text;
                }
                if (index == 29 + noise) {
                    cde.cdiscId = text;
                }
                index++;
            }
            form.getCdes().add(cde);
        }
    }

    public void switchTabAndClose(WebDriver driver, int i) {
        ArrayList<String> tabs;
        tabs = new ArrayList<String>(driver.getWindowHandles());
        driver.close();
        driver.switchTo().window(tabs.get(i));
    }


    public void switchTab(WebDriver driver, int i) {
        ArrayList<String> tabs;
        tabs = new ArrayList<String>(driver.getWindowHandles());
        driver.switchTo().window(tabs.get(i));
    }
}
