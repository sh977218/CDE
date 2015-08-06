package gov.nih.nlm.cde.common.test;

import java.util.ArrayList;

/**
 * Created by huangs8 on 8/4/2015.
 */
public class Form {
    private String name;
    private String description;
    private String download;
    private ArrayList<String> cdes;
    private String versionNum;
    private String versionDate;
    private String diseaseName;
    private String subDiseaseName;
    private Boolean isCopyrighted;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDownload() {
        return download;
    }

    public void setDownload(String download) {
        this.download = download;
    }

    public ArrayList<String> getCdes() {
        return cdes;
    }

    public void setCdes(ArrayList<String> cdes) {
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

    public Boolean isCopyrighted() {
        return isCopyrighted;
    }

    public void setIsCopyrighted(Boolean isCopyrighted) {
        this.isCopyrighted = isCopyrighted;
    }

    @Override
    public String toString() {
        return "Form{" +
                "name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", download='" + download + '\'' +
                ", cdes=" + cdes +
                ", versionNum='" + versionNum + '\'' +
                ", versionDate='" + versionDate + '\'' +
                ", diseaseName='" + diseaseName + '\'' +
                ", subDiseaseName='" + subDiseaseName + '\'' +
                ", isCopyrighted=" + isCopyrighted +
                '}';
    }
}
