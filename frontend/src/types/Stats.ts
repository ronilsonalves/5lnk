export default interface Stats {
    links: {
        clicks: number;
        total: number;
    }
    pages: {
        views: number;
        total: number;
    }
}

export interface LinkStats {
    id: string;
    linkRefer: string;
    timestamp: Date;
    os: string;
    browser: string;
}

export interface LinkStatsByDate {
    total: number;
    date: Date;
    os: string;
    browser: string;
}

export interface StatsByDate {
    total: number;
    date: Date;
    os: string;
    browser: string;
}