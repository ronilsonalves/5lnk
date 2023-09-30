// Define the Link type
export default interface Link {
    id: string;
    original: string;
    shortened: string;
    finalUrl: string;
    userId: string;
    createdAt: Date;
    clicks: number;
}