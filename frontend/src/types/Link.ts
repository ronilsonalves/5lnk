// Define the Link type
export default interface Link {
    id: string;
    original: string;
    title: string;
    shortened: string;
    finalUrl: string;
    userId: string;
    pageRefer?: string;
    createdAt: Date;
    clicks: number;
}