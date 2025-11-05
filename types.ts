import type React from 'react';

export type Page = 'Dashboard' | 'Scans' | 'Simulation' | 'PQCReadiness' | 'Integrations' | 'Templates' | 'Workshops' | 'Settings' | 'PRDGenerator' | 'CreatorStudio';

export interface NavItem {
  name: Page;
  icon: React.ReactNode;
}

export enum ScanStatus {
  Pending = 'Pending',
  Running = 'Running',
  Completed = 'Completed',
  Failed = 'Failed',
}

export interface Vulnerability {
  id: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  recommendation: string;
}

export interface ScanResult {
  vulnerabilities: Vulnerability[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  metrics: {
    executionSpeed: number;
    testCoverage: number;
    defectDensity: number;
  };
}

export interface Scan {
  id: string;
  contractAddress: string;
  status: ScanStatus;
  submittedAt: Date;
  completedAt?: Date;
  result?: ScanResult;
}

export interface IntegrationState {
  connected: boolean;
  projectId: string;
}

export interface AppIntegrations {
  asana: IntegrationState;
  monday: IntegrationState;
}

export interface IntegrationEvent {
  id: string;
  timestamp: Date;
  message: string;
  tool: 'Asana' | 'Monday.com' | 'General';
}

export interface Notification {
  id: string;
  type: 'vulnerable' | 'migrated';
  message: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}