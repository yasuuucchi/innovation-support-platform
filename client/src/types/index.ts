export interface Idea {
  id: number;
  name: string;
  targetCustomer: string;
  priceRange: string;
  value: string;
  competitors: string;
  createdAt: string;
  updatedAt: string;
}

export interface Analysis {
  id: number;
  ideaId: number;
  ideaScore: number;
  snsTrends: {
    positive: number;
    negative: number;
    neutral: number;
  };
  marketSize: {
    current: number;
    potential: number;
    cagr: number;
  };
  technicalMaturity: number;
  personaSize: number;
  createdAt: string;
}

export interface BehaviorLog {
  id: number;
  ideaId: number;
  eventType: string;
  eventData: Record<string, any>;
  createdAt: string;
}

export interface Interview {
  id: number;
  ideaId: number;
  content: string;
  satisfactionScore: number;
  keyPhrases: string[];
  sentiment: {
    positive: string[];
    negative: string[];
  };
  createdAt: string;
}
