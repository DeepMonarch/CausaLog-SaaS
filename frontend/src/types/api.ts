export interface Upload {
  id: string
  filename: string
  original_filename: string
  file_size: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
}

export interface AnalysisStatus {
  id: string
  upload_id: string
  status: 'running' | 'completed' | 'failed'
  created_at: string
  completed_at: string | null
  error_message: string | null
}

export interface AnalysisDetail extends AnalysisStatus {
  keywords: {
    top_keywords: string[]
    keyword_frequencies: Record<string, number>
  } | null
  clusters: {
    num_clusters: number
    clusters: ClusterSummary[]
  } | null
  anomalies: {
    total_anomalies: number
    anomaly_rate: number
    anomalous_records: AnomalousRecord[]
  } | null
  evidence: Record<string, unknown> | null
  inference_result: InferenceResult | null
}

export interface ClusterSummary {
  cluster_id: number
  size: number
  top_terms: string[]
  level_distribution: Record<string, number>
  severity: string
  sample_messages: string[]
}

export interface AnomalousRecord {
  line_number: number
  level: string
  service: string
  message: string
  anomaly_score: number
}

export interface InferenceResult {
  rule_id: string
  root_cause: string
  confidence: number
  severity: string
  explanation: string
  suggested_fixes: string[]
}

export interface Report {
  id: string
  analysis_id: string
  root_cause: string
  confidence: number
  severity: string
  summary: string | null
  suggested_fixes: string[] | null
  evidence_summary: Record<string, unknown> | null
  created_at: string
}

export interface HistoryItem {
  upload_id: string
  original_filename: string
  file_size: number
  status: string
  created_at: string
  report_id: string | null
  root_cause: string | null
  severity: string | null
}