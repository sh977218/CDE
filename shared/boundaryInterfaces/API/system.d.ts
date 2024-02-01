import { IdSource, User } from 'shared/models.model';
import { HomePage, HomePageDraft } from 'shared/singleton.model';

type UserGetResponse = User | {};

type AttachmentAttachResponse = { fileId: string };
type AttachmentDetachRequest = { fileId: string };

type HomepageDraftGetResponse = HomePageDraft | null;
type HomepageDraftPutRequest = Partial<HomePageDraft>;
type HomepageDraftPutResponse = HomePageDraft;
type HomepageGetResponse = HomePage | null;
type HomepagePutRequest = HomePage;
type HomepagePutResponse = HomePage;

type IdSourceGetResponse = IdSource | null;
type IdSourcePutResponse = void;
type IdSourceRequest = IdSource;
type IdSourceResponse = IdSource;
type IdSourcesResponse = IdSource[];
