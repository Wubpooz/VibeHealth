export interface WikiCondition {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  vidalUrl: string;
  details: {
    clinicalArea: string;
    riskFactors: string;
    diagnostics: string;
    treatments: string;
  };
  tags: string[];
}
