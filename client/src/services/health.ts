/**
 * Health monitoring service
 * Handles health vitals and monitoring data
 */

import { apiPost } from '../api/client';

export interface HealthVital {
  id: string;
  type: 'blood_pressure' | 'heart_rate' | 'blood_sugar' | 'temperature' | 'weight' | 'oxygen';
  value: number;
  unit: string;
  timestamp: string;
  notes?: string;
}

export interface HealthVitalInput {
  type: HealthVital['type'];
  value: number;
  unit: string;
  notes?: string;
}

export interface HealthTrend {
  type: string;
  data: Array<{ date: string; value: number }>;
  average: number;
  trend: 'improving' | 'stable' | 'declining';
}

/**
 * Get latest health vitals
 */
export async function getLatestVitals(): Promise<HealthVital[]> {
  // Mock data for now - replace with real API endpoint when available
  return [
    {
      id: '1',
      type: 'blood_pressure',
      value: 120,
      unit: 'mmHg',
      timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'heart_rate',
      value: 72,
      unit: 'bpm',
      timestamp: new Date().toISOString(),
    },
    {
      id: '3',
      type: 'blood_sugar',
      value: 95,
      unit: 'mg/dL',
      timestamp: new Date().toISOString(),
    },
    {
      id: '4',
      type: 'temperature',
      value: 98.6,
      unit: '°F',
      timestamp: new Date().toISOString(),
    },
  ];
}

/**
 * Get health trends for a period
 */
export async function getHealthTrends(
  type: string,
  days: number = 7
): Promise<HealthTrend> {
  // Generate mock trend data
  const data: Array<{ date: string; value: number }> = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate realistic mock data based on type
    let baseValue = 0;
    let variance = 0;
    
    switch (type) {
      case 'blood_pressure':
        baseValue = 120;
        variance = Math.random() * 10 - 5; // ±5 variance
        break;
      case 'heart_rate':
        baseValue = 72;
        variance = Math.random() * 8 - 4; // ±4 variance
        break;
      case 'blood_sugar':
        baseValue = 95;
        variance = Math.random() * 15 - 7.5; // ±7.5 variance
        break;
      case 'temperature':
        baseValue = 98.6;
        variance = Math.random() * 0.6 - 0.3; // ±0.3 variance
        break;
      default:
        baseValue = 50;
        variance = Math.random() * 10 - 5;
    }
    
    data.push({
      date: date.toISOString(),
      value: Math.round((baseValue + variance) * 10) / 10,
    });
  }
  
  const values = data.map((d) => d.value);
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  
  // Determine trend
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (type === 'blood_pressure' || type === 'blood_sugar') {
    trend = secondAvg < firstAvg ? 'improving' : secondAvg > firstAvg ? 'declining' : 'stable';
  } else {
    trend = Math.abs(secondAvg - firstAvg) < 2 ? 'stable' : secondAvg < firstAvg ? 'improving' : 'declining';
  }
  
  return {
    type,
    data,
    average: Math.round(average * 10) / 10,
    trend,
  };
}

/**
 * Record a health vital
 */
export async function recordVital(vital: HealthVitalInput): Promise<HealthVital> {
  return apiPost<HealthVital>('/health/vitals', vital);
}

