
// Crack time simulation using bcrypt/SHA-256 performance benchmarks
// Based on real-world password cracking benchmarks

interface CrackTimeEstimate {
  algorithm: 'bcrypt' | 'sha256' | 'md5';
  hashesPerSecond: number; // Typical hashes per second on consumer hardware
  timeToBreak: string; // Human-readable time
  timeInSeconds: number; // Raw time in seconds
}

// Hash function performance benchmarks on modern hardware (hashes per second)
// These values are based on real-world benchmarks using consumer GPUs
const hashPerformance = {
  bcrypt: {
    cpu: 15, // bcrypt is intentionally slow
    gpu: 50,
    cluster: 500
  },
  sha256: {
    cpu: 500_000_000, // 500 million
    gpu: 8_600_000_000, // 8.6 billion
    cluster: 100_000_000_000 // 100 billion
  },
  md5: {
    cpu: 1_500_000_000, // 1.5 billion
    gpu: 30_000_000_000, // 30 billion
    cluster: 200_000_000_000 // 200 billion
  }
};

// Helper function to format time
export const formatCrackTime = (seconds: number): string => {
  if (seconds < 1) return "Instantly";
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 2592000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 31536000) return `${Math.round(seconds / 2592000)} months`;
  if (seconds < 315360000) return `${Math.round(seconds / 31536000)} years`;
  
  const centuries = seconds / 31536000 / 100;
  if (centuries < 1000) return `${Math.round(centuries)} centuries`;
  if (centuries < 1000000) return `${Math.round(centuries / 1000)}k centuries`;
  
  return "Heat death of universe";
};

// Calculate estimated time to crack based on entropy
export const estimateCrackTime = (entropy: number): Record<string, CrackTimeEstimate> => {
  // Calculate the total possible combinations
  const combinations = Math.pow(2, entropy);
  
  // On average, half of the combinations need to be tried
  const avgCombinations = combinations / 2;
  
  // Calculate time to break for each algorithm and hardware combination
  const bcryptCPU = {
    algorithm: 'bcrypt' as const,
    hashesPerSecond: hashPerformance.bcrypt.cpu,
    timeInSeconds: avgCombinations / hashPerformance.bcrypt.cpu,
    timeToBreak: formatCrackTime(avgCombinations / hashPerformance.bcrypt.cpu)
  };
  
  const bcryptGPU = {
    algorithm: 'bcrypt' as const,
    hashesPerSecond: hashPerformance.bcrypt.gpu,
    timeInSeconds: avgCombinations / hashPerformance.bcrypt.gpu,
    timeToBreak: formatCrackTime(avgCombinations / hashPerformance.bcrypt.gpu)
  };
  
  const sha256CPU = {
    algorithm: 'sha256' as const,
    hashesPerSecond: hashPerformance.sha256.cpu,
    timeInSeconds: avgCombinations / hashPerformance.sha256.cpu,
    timeToBreak: formatCrackTime(avgCombinations / hashPerformance.sha256.cpu)
  };
  
  const sha256GPU = {
    algorithm: 'sha256' as const,
    hashesPerSecond: hashPerformance.sha256.gpu,
    timeInSeconds: avgCombinations / hashPerformance.sha256.gpu,
    timeToBreak: formatCrackTime(avgCombinations / hashPerformance.sha256.gpu)
  };
  
  const sha256Cluster = {
    algorithm: 'sha256' as const,
    hashesPerSecond: hashPerformance.sha256.cluster,
    timeInSeconds: avgCombinations / hashPerformance.sha256.cluster,
    timeToBreak: formatCrackTime(avgCombinations / hashPerformance.sha256.cluster)
  };
  
  return {
    'bcrypt (CPU)': bcryptCPU,
    'bcrypt (GPU)': bcryptGPU,
    'SHA-256 (CPU)': sha256CPU,
    'SHA-256 (GPU)': sha256GPU,
    'SHA-256 (Cluster)': sha256Cluster
  };
};

// Helper functions for crack time simulation based on character sets and length
export const crackTimesInSeconds = {
  // Fast offline hash cracking (e.g., SHA-256 on GPU)
  fastOfflineHash: (length: number, charSetCount: number) => {
    const combinations = Math.pow(Math.min(charSetCount * 26, 95), length);
    return combinations / hashPerformance.sha256.gpu;
  },
  
  // Online throttled attack (e.g., website login with rate limiting)
  onlineThrottled: (length: number, charSetCount: number) => {
    const combinations = Math.pow(Math.min(charSetCount * 26, 95), length);
    // Assuming 100 attempts per hour due to rate limiting
    return combinations / (100 / 3600);
  }
};
