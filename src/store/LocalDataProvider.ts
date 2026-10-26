// src/store/LocalDataProvider.ts
// Mock data provider for STANDALONE DEMO mode
export const LocalDataProvider = {
  getTelemetry: () => {
    return {
      temperature: Math.random() * 20 + 40,
      vibration: Math.random() * 5,
      rpm: Math.random() * 500 + 1000,
    };
  },
  getNetworkStatus: () => {
    return {
      latency: Math.random() * 10 + 5, // ms
      packetLoss: 0,
      status: 'OK'
    };
  }
};
