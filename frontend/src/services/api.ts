import axios from 'axios';
import { AnalysisResult } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export async function analyzeStock(symbol: string, provider: string, dataSource: string, model?: string): Promise<AnalysisResult> {
  try {
    const response = await axios.post<AnalysisResult>(`${API_BASE_URL}/api/analyze`, {
      symbol: symbol.toUpperCase(),
      provider: provider,
      dataSource: dataSource,
      model: model || undefined,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || '网络请求失败');
    }
    throw error;
  }
}
