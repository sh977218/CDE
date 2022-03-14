import { IdSource } from 'shared/models.model';
import { HomePage, HomePageDraft } from 'shared/singleton.model';

type HomepageDraftGetResponse = HomePageDraft | null
type HomepageDraftPutRequest = Partial<HomePageDraft>;
type HomepageDraftPutResponse = HomePageDraft;
type HomepageGetResponse = HomePage | null
type HomepagePutRequest = HomePage;
type HomepagePutResponse = HomePage;
type HomepageAttachResponse = {fileId: string};
type HomepageDetachRequest = {fileId: string};

type IdSourceGetResponse = IdSource | null;
type IdSourcePutResponse = void;
type IdSourceRequest = IdSource;
type IdSourceResponse = IdSource;
type IdSourcesResponse = IdSource[];
