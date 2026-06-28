import api from './auth.service'

import type {
  Upload,
  AnalysisStatus,
  AnalysisDetail,
  Report,
  HistoryItem
} from '../types/api'


export const uploadService = {

  async uploadFile(file: File): Promise<Upload> {
    const form = new FormData()
    form.append("file", file)

    const res = await api.post<Upload>(
      "/uploads",
      form,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )

    return res.data
  },


  async listUploads(): Promise<Upload[]> {
    const res = await api.get<Upload[]>("/uploads")
    return res.data
  }

}



export const analysisService = {

  async startAnalysis(uploadId: string): Promise<AnalysisStatus> {

    const res = await api.post<AnalysisStatus>(
      `/analysis/${uploadId}`
    )

    return res.data
  },


  async getAnalysis(uploadId: string): Promise<AnalysisDetail> {

    const res = await api.get<AnalysisDetail>(
      `/analysis/${uploadId}`
    )

    return res.data
  }

}



export const reportService = {

  async listReports(): Promise<Report[]> {

    const res = await api.get<Report[]>("/reports")

    return res.data
  },


  async getReport(reportId: string): Promise<Report> {

    const res = await api.get<Report>(
      `/reports/${reportId}`
    )

    return res.data
  }

}



export const historyService = {

  async getHistory(): Promise<HistoryItem[]> {

    const res = await api.get<HistoryItem[]>("/history")

    return res.data
  }

}