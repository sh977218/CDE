package gov.nih.nlm.ninds.form;

/**
 * Created by huangs8 on 8/7/2015.
 */
public class ReferenceDocument implements Comparable {
    String docType;
    String document;
    String referenceDocumentId;
    String text;
    String uri;
    String providerOrg;
    String title;
    String languageCode;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        ReferenceDocument that = (ReferenceDocument) o;

        if (docType != null ? !docType.equals(that.docType) : that.docType != null) return false;
        if (document != null ? !document.equals(that.document) : that.document != null) return false;
        if (referenceDocumentId != null ? !referenceDocumentId.equals(that.referenceDocumentId) : that.referenceDocumentId != null)
            return false;
        if (text != null ? !text.equals(that.text) : that.text != null) return false;
        if (uri != null ? !uri.equals(that.uri) : that.uri != null) return false;
        if (providerOrg != null ? !providerOrg.equals(that.providerOrg) : that.providerOrg != null) return false;
        if (title != null ? !title.equals(that.title) : that.title != null) return false;
        return !(languageCode != null ? !languageCode.equals(that.languageCode) : that.languageCode != null);
    }

    @Override
    public int hashCode() {
        int result = (uri != null ? uri.hashCode() : 0);
        return result;
    }

    @Override
    public int compareTo(Object o) {
        ReferenceDocument referenceDocument = (ReferenceDocument) o;
        return ((ReferenceDocument) o).uri.compareTo(this.uri);
    }
}
