package gov.nih.nlm.ninds.form;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.Date;

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
        this.diseaseName = diseaseName;
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
