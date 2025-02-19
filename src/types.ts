export interface Post {
    id?: string;
    skill: string;
    description: string;
    latitude: string;
    distance?: number;
    longitude: string;
    userId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
