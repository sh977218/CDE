import { ObjectId } from 'shared/models.model';

export interface Singleton {
    body: any;
    updated: number; // optimistic lock
    updatedBy: ObjectId;
    updateInProgress?: any; // pessimistic lock (flag + ownerUser + expiryTimestamp)
}

export interface SingletonServer extends Singleton {
    readonly _id: string;
}

export interface HomePage extends Singleton {
    updated: number;
    updatedBy: ObjectId;
    body: {
        updates: UpdateCard[];
    };
}

export interface HomePageDraft extends HomePage {
    updateInProgress?: boolean;
}

export interface UpdateCard {
    body: string;
    buttons: {
        title: string;
        link: string;
    }[];
    image?: {
        fileId: string;
        uploadedBy: ObjectId;
    };
    imageAltText: string;
    title: string;
}
