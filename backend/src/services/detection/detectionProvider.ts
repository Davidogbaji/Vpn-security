import { DetectionResult, IpIntelligence } from '../../types/index.js';

export interface DetectionProvider {
  name: string;
  checkIp(ip?: string): Promise<{
    detection: DetectionResult;
    intelligence?: IpIntelligence;
  }>;
}
