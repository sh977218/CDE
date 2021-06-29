import { ElasticQueryResponseAggregationBucket } from 'shared/models.model';

export interface BoardFilter {
    search?: string;
    sortDirection?: string;
    selectedTags: string[];
    selectedTypes: string[];
    selectedShareStatus: string[];
    sortBy: string;
    tags: ElasticQueryResponseAggregationBucket[];
    types: ElasticQueryResponseAggregationBucket[];
}
