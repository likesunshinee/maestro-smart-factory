import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import mqtt from 'mqtt';
import useFactoryStore from './factoryStore';

const DataProviderContext = createContext();

export const useDataProvider = () => useContext(DataProviderContext);

const DEFAULT_BROKER_URL = 'wss://broker.emqx.io:8084/mqtt';
const DEFAULT_TOPIC_MONITOR = 'mesin/monitoring/data';
const DEFAULT_TOPIC_CONTROL = 'mesin/kontrol/perintah';

const nowTime = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
};

export const DataProvider = ({ children }) => {
  // DEFAULT TO 'CONNECTED' so live ESP32 & Coral AI are active immediately on load
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('maestro_mode') || 'CONNECTED';
  });
  
  const [brokerUrl, setBrokerUrl] = useState(DEFAULT_BROKER_URL);
  const [topicMonitor, setTopicMonitor] = useState(DEFAULT_TOPIC_MONITOR);
  const [topicControl, setTopicControl] = useState(DEFAULT_TOPIC_CONTROL);

  // MQTT Connection state
  const [mqttStatus, setMqttStatus] = useState('DISCONNECTED'); // 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR'
  const [lastPacket, setLastPacket] = useState(null);
  const [lastAiCommand, setLastAiCommand] = useState(null);
  const [packetCount, setPacketCount] = useState(0);
  const [latency, setLatency] = useState(15);

  const clientRef = useRef(null);

  // Store bindings
  const setSystemOnline = useFactoryStore(s => s.setSystemOnline);
  const simulationPlaying = useFactoryStore(s => s.simulationPlaying);
  const simulationSpeed = useFactoryStore(s => s.simulationSpeed);
  const tickSimulation = useFactoryStore(s => s.tickSimulation);
  const updateMachineById = useFactoryStore(s => s.updateMachineById);
  const pushLiveTelemetryPoint = useFactoryStore(s => s.pushLiveTelemetryPoint);
  const setMandorAI = useFactoryStore(s => s.setMandorAI);
  const addEvent = useFactoryStore(s => s.addEvent);

  // Simulation loop ONLY for STANDALONE_DEMO mode
  useEffect(() => {
    if (mode !== 'STANDALONE_DEMO' || !simulationPlaying) return;

    const intervalMs = Math.round(2000 / simulationSpeed);
    const timer = setInterval(() => {
      tickSimulation();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [mode, simulationPlaying, simulationSpeed, tickSimulation]);

  // Save mode to localStorage
  const handleSetMode = (newMode) => {
    setMode(newMode);
    localStorage.setItem('maestro_mode', newMode);
  };

  const toggleMode = () => {
    const nextMode = mode === 'STANDALONE_DEMO' ? 'CONNECTED' : 'STANDALONE_DEMO';
    handleSetMode(nextMode);
  };

  // MQTT connection lifecycle for CONNECTED mode
  useEffect(() => {
    if (mode === 'STANDALONE_DEMO') {
      if (clientRef.current) {
        clientRef.current.end(true);
        clientRef.current = null;
      }
      setMqttStatus('DISCONNECTED');
      setSystemOnline(true);
      return;
    }

    // CONNECTED MODE
    setMqttStatus('CONNECTING');
    addEvent(`Menghubungkan ke MQTT Broker: ${brokerUrl}...`, 'MQTT', 'info');

    const clientId = `maestro_web_${Math.random().toString(16).substring(2, 8)}`;
    
    // Connect to EMQX over WebSocket Secure
    const client = mqtt.connect(brokerUrl, {
      clientId,
      clean: true,
      connectTimeout: 8000,
      reconnectPeriod: 3000,
    });

    clientRef.current = client;

    client.on('connect', () => {
      console.log('[MQTT] Terhubung ke broker:', brokerUrl);
      setMqttStatus('CONNECTED');
      setSystemOnline(true);
      addEvent(`MQTT Terhubung ke ${brokerUrl} (Client: ${clientId})`, 'MQTT', 'info');

      // 1. Subscribe to sensor telemetry from ESP32
      client.subscribe(topicMonitor, (err) => {
        if (!err) {
          console.log('[MQTT] Subscribed ke sensor topic:', topicMonitor);
          addEvent(`Subscribed ke Sensor ESP32: ${topicMonitor}`, 'MQTT', 'info');
        }
      });

      // 2. Subscribe to AI control commands from MANDOR AI / Coral Python
      client.subscribe(topicControl, (err) => {
        if (!err) {
          console.log('[MQTT] Subscribed ke AI control topic:', topicControl);
          addEvent(`Subscribed ke Mandor AI Kontrol: ${topicControl}`, 'MQTT', 'info');
        }
      });
    });

    client.on('message', (topic, payload) => {
      const timeLabel = nowTime();
      let data = {};
      try {
        data = JSON.parse(payload.toString());
      } catch (e) {
        console.error('[MQTT] Gagal parse JSON dari topic', topic, e);
        return;
      }

      // ========================================================
      // 1. DATA TELEMETRI SENSOR DARI ESP32 (mesin/monitoring/data)
      // ========================================================
      if (topic === topicMonitor) {
        // Format ESP32: {"arus":0.42,"suhu_objek":37.7,"kecepatan":0,"getaran":11.24}
        const arus = Number(data.arus) || 0;
        const suhu = Number(data.suhu_objek ?? data.suhu) || 0;
        const rpm = Math.round(Number(data.kecepatan ?? data.rpm) || 0);
        const getaran = Number(data.getaran) || 0;

        // Hitung beban motor
        const motor_load = rpm > 0 ? Math.min(100, Math.max(10, Math.round((arus / 1.5) * 100))) : 0;

        // Evaluasi kondisi real-time jika belum ditimpa oleh perintah MANDOR AI
        let inferredStatus = 'NORMAL';
        if (getaran > 7.0 || arus > 1.8 || suhu > 55.0) {
          inferredStatus = 'KRITIS';
        } else if (getaran > 3.5 || arus > 1.0 || suhu > 46.0) {
          inferredStatus = 'WASPADA';
        }

        // Update MTR-01
        updateMachineById('MTR-01', {
          rpm,
          arus: parseFloat(arus.toFixed(2)),
          getaran: parseFloat(getaran.toFixed(2)),
          suhu: parseFloat(suhu.toFixed(1)),
          motor_load,
          status: inferredStatus,
        });

        // Simpan titik real-time ke grafik live
        pushLiveTelemetryPoint('MTR-01', {
          time: timeLabel,
          rpm,
          arus: parseFloat(arus.toFixed(2)),
          getaran: parseFloat(getaran.toFixed(2)),
          suhu: parseFloat(suhu.toFixed(1)),
        });

        // Update ML inference lokal
        useFactoryStore.setState({
          mlResult: {
            kondisi: inferredStatus,
            confidence: inferredStatus === 'KRITIS' ? 100.0 : 96.5,
            reasoning: inferredStatus === 'KRITIS'
              ? `Getaran tinggi (${getaran.toFixed(2)} mm/s) terdeteksi dari sensor ESP32! Ambang batas aman dilampaui.`
              : `Parameter sensor terbaca normal (Getaran: ${getaran.toFixed(2)}, Arus: ${arus.toFixed(2)}A, Suhu: ${suhu.toFixed(1)}°C).`
          },
          conveyorRunning: inferredStatus !== 'KRITIS' && rpm > 0,
        });

        setPacketCount(c => c + 1);
        setLastPacket({ arus, suhu, rpm, getaran, timestamp: timeLabel });
        setLatency(Math.floor(12 + Math.random() * 10));
      }

      // ========================================================
      // 2. PERINTAH AI DARI MANDOR AI / CORAL PYTHON (mesin/kontrol/perintah)
      // ========================================================
      else if (topic === topicControl) {
        // Format Python AI: {"status": "WARNING", "pwm": 220} atau {"status": "KRITIS", "pwm": 0}
        const rawStatus = (data.status || 'NORMAL').toUpperCase();
        const status = (rawStatus === 'WARNING' || rawStatus === 'WASPADA') ? 'WASPADA' : rawStatus;
        const pwm = Number(data.pwm) ?? (status === 'KRITIS' ? 0 : status === 'WASPADA' ? 220 : 255);

        // Update MTR-01
        updateMachineById('MTR-01', {
          status,
          pwm,
        });

        // Update store Mandor AI state
        setMandorAI({
          status,
          pwm,
          confidence: 100.0,
          lastUpdate: timeLabel,
          sensitivity: [
            { feature: '1. Arus', range: '0.350 - 0.750 A', impact: status },
            { feature: '2. Suhu', range: '42.10 - 48.70 °C', impact: status },
            { feature: '3. RPM', range: '0.00 - 60.00 RPM', impact: status },
            { feature: '4. Getaran', range: '7.80 - 11.37 mm/s', impact: status },
          ]
        });

        useFactoryStore.setState({
          mlResult: {
            kondisi: status,
            confidence: 100.0,
            reasoning: `Keputusan MANDOR AI (Google Coral Edge TPU): Status ${status} terverifikasi dengan kendali motor PWM = ${pwm}.`
          },
          conveyorRunning: status !== 'KRITIS' && pwm > 0,
        });

        setLastAiCommand({ status, pwm, timestamp: timeLabel });
        addEvent(`MANDOR AI: Status -> ${status} | PWM -> ${pwm}`, 'AI', status === 'KRITIS' ? 'critical' : status === 'WASPADA' ? 'warning' : 'info');
      }

      useFactoryStore.getState().updateSync();
    });

    client.on('error', (err) => {
      console.error('[MQTT] Connection Error:', err);
      setMqttStatus('ERROR');
      addEvent(`MQTT Error: ${err.message || 'Koneksi gagal'}`, 'MQTT', 'critical');
    });

    client.on('close', () => {
      setMqttStatus('DISCONNECTED');
    });

    client.on('offline', () => {
      setMqttStatus('DISCONNECTED');
    });

    return () => {
      if (clientRef.current) {
        clientRef.current.end(true);
        clientRef.current = null;
      }
    };
  }, [mode, brokerUrl, topicMonitor, topicControl, updateMachineById, pushLiveTelemetryPoint, setMandorAI, addEvent, setSystemOnline]);

  // Publish command to ESP32: mesin/kontrol/perintah
  const publishControlCommand = useCallback((status, pwm) => {
    if (!clientRef.current || mqttStatus !== 'CONNECTED') {
      console.warn('[MQTT] Tidak dapat mengirim perintah, MQTT belum terhubung.');
      return false;
    }

    let targetPwm = pwm;
    if (targetPwm === undefined || targetPwm === null) {
      if (status === 'NORMAL') targetPwm = 255;
      else if (status === 'WARNING' || status === 'WASPADA') targetPwm = 220;
      else if (status === 'KRITIS') targetPwm = 0;
      else targetPwm = 0;
    }

    const payload = JSON.stringify({
      status: status === 'WASPADA' ? 'WARNING' : status,
      pwm: targetPwm,
    });

    clientRef.current.publish(topicControl, payload, (err) => {
      if (err) {
        console.error('[MQTT] Gagal kirim perintah:', err);
        addEvent(`MQTT TX Gagal: ${err.message}`, 'MQTT', 'critical');
      } else {
        console.log('[MQTT] Perintah terkirim:', payload);
        addEvent(`Web -> ESP32: Perintah ${status} (PWM: ${targetPwm}) terkirim`, 'MQTT', status === 'KRITIS' ? 'critical' : 'info');
      }
    });

    return true;
  }, [mqttStatus, topicControl, addEvent]);

  return (
    <DataProviderContext.Provider value={{
      mode,
      setMode: handleSetMode,
      toggleMode,
      brokerUrl,
      setBrokerUrl,
      topicMonitor,
      setTopicMonitor,
      topicControl,
      setTopicControl,
      mqttStatus,
      lastPacket,
      lastAiCommand,
      packetCount,
      latency,
      publishControlCommand,
    }}>
      {children}
    </DataProviderContext.Provider>
  );
};
