package gov.nih.nlm.ninds.form;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Document(collection = "ninds")
public class MyForm {
    @Id
    private String id;
    private int page = 0;
    private int row = 0;
    private String url = "";
    private String crfModuleGuideline = "";
    private String description = "";
    private boolean copyRight = false;
    private String downloadLink = "";
    private String formId = "";
    private ArrayList<Cde> cdes = new ArrayList<Cde>();
    private String versionNum = "";
    private String versionDate = "";
    private String diseaseName = "";
    private String subDiseaseName = "";
    private String domainName = "";
    private String subDomainName = "";
    private Date createDate;

    private static Map<String, String> diseaseNameMap = new HashMap<String, String>();

    static {
        diseaseNameMap.put("Amyotrophic Lateral Sclerosis", "Amyotrophic Lateral Sclerosis");
        diseaseNameMap.put("Congenital Muscular Dystrophy", "Congenital Muscular Dystrophy");
        diseaseNameMap.put("Duchenne Muscular Dystrophy/Becker Muscular Dystrophy", "Duchenne/Becker Muscular Dystrophy");
        diseaseNameMap.put("Epilepsy", "Epilepsy");
        diseaseNameMap.put("Facioscapulohumeral Muscular Dystrophy", "Facioscapulohumeral muscular dystrophy (FSHD)");
        diseaseNameMap.put("Friedreich's Ataxia", "Friedreich's Ataxia");
        diseaseNameMap.put("General (For all diseases)", "General (For all diseases)");
        diseaseNameMap.put("Headache", "Headache");
        diseaseNameMap.put("Huntington's Disease", "Huntington’s Disease");
        diseaseNameMap.put("Mitochondrial Disease", "Mitochondrial Disease");
        diseaseNameMap.put("Multiple Sclerosis", "Multiple Sclerosis");
        diseaseNameMap.put("Myasthenia Gravis", "Myasthenia Gravis");
        diseaseNameMap.put("Myotonic Muscular Dystrophy", "Myotonic Dystrophy");
        diseaseNameMap.put("Neuromuscular Diseases", "Neuromuscular Diseases");
        diseaseNameMap.put("Parkinson's Disease", "Parkinson's Disease");
        diseaseNameMap.put("Spinal Cord Injury", "Spinal Cord Injury");
        diseaseNameMap.put("Spinal Muscular Atrophy", "Spinal Muscular Atrophy");
        diseaseNameMap.put("Stroke", "Stroke");
        diseaseNameMap.put("Traumatic Brain Injury", "Traumatic Brain Injury");
    }

    public MyForm() {
    }

    public Date getCreateDate() {
        return createDate;
    }

    public void setCreateDate(Date createDate) {
        this.createDate = createDate;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getRow() {
        return row;
    }

    public void setRow(int row) {
        this.row = row;
    }

    public String getCrfModuleGuideline() {
        return crfModuleGuideline;
    }

    public void setCrfModuleGuideline(String crfModuleGuideline) {
        this.crfModuleGuideline = crfModuleGuideline;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isCopyRight() {
        return copyRight;
    }

    public void setCopyRight(boolean copyRight) {
        this.copyRight = copyRight;
    }

    public String getDownloadLink() {
        return downloadLink;
    }

    public void setDownloadLink(String downloadLink) {
        this.downloadLink = downloadLink;
    }

    public String getFormId() {
        return formId;
    }

    public void setFormId(String formId) {
        this.formId = formId;
    }

    public ArrayList<Cde> getCdes() {
        return cdes;
    }

    public void setCdes(ArrayList<Cde> cdes) {
        this.cdes = cdes;
    }

    public String getVersionNum() {
        return versionNum;
    }

    public void setVersionNum(String versionNum) {
        this.versionNum = versionNum;
    }

    public String getVersionDate() {
        return versionDate;
    }

    public void setVersionDate(String versionDate) {
        this.versionDate = versionDate;
    }

    public String getDiseaseName() {
        return diseaseName;
    }

    public void setDiseaseName(String diseaseName) {
        String disease = this.diseaseNameMap.get(diseaseName);
        if (disease == null || disease.length() == 0) {
            System.out.println("form:" + this.toString() + "\n has error diseaseName:" + diseaseName);
            System.exit(0);
        }
        this.diseaseName = disease;
    }

    public String getSubDiseaseName() {
        return subDiseaseName;
    }

    public void setSubDiseaseName(String subDiseaseName) {
        this.subDiseaseName = subDiseaseName;
    }

    public String getDomainName() {
        return domainName;
    }

    public void setDomainName(String domainName) {
        this.domainName = domainName;
    }

    public String getSubDomainName() {
        return subDomainName;
    }

    public void setSubDomainName(String subDomainName) {
        this.subDomainName = subDomainName;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    @Override
    public String toString() {
        return "MyForm{" +
                "id='" + id + '\'' +
                ", page=" + page +
                ", row=" + row +
                ", url='" + url + '\'' +
                ", crfModuleGuideline='" + crfModuleGuideline + '\'' +
                ", description='" + description + '\'' +
                ", copyRight=" + copyRight +
                ", downloadLink='" + downloadLink + '\'' +
                ", formId='" + formId + '\'' +
                ", cdes=" + cdes +
                ", versionNum='" + versionNum + '\'' +
                ", versionDate='" + versionDate + '\'' +
                ", diseaseName='" + diseaseName + '\'' +
                ", subDiseaseName='" + subDiseaseName + '\'' +
                ", domainName='" + domainName + '\'' +
                ", subDomainName='" + subDomainName + '\'' +
                ", createDate=" + createDate +
                '}';
    }
}
