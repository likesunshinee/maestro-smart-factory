import { create } from 'zustand';

const OBJECT_CLASSES = [
  { kelas: 'Balok Kecil', panjang: 100, lebar: 60, tinggi: 40, weight: 0.8 },
  { kelas: 'Balok Sedang', panjang: 120, lebar: 80, tinggi: 60, weight: 1.4 },
  { kelas: 'Balok Besar', panjang: 150, lebar: 90, tinggi: 75, weight: 2.1 },
  { kelas: 'Silinder', panjang: 70, lebar: 70, tinggi: 90, weight: 1.6, diameter: 70 },
];

const SCENARIOS = {
  NORMAL: {
    objectIndex: 0,
    machine: { rpm: 1480, arus: 0.84, getaran: 2.1, suhu: 42.8, motor_load: 63, status: 'NORMAL' },
    mlResult: { kondisi: 'NORMAL', confidence: 95.2, reasoning: 'Semua parameter motor dalam batas normal. Tidak ada anomali terdeteksi.' },
  },
  OBJEK_BESAR: {
    objectIndex: 2,
    machine: { rpm: 1420, arus: 1.12, getaran: 3.4, suhu: 45.2, motor_load: 78, status: 'NORMAL' },
    mlResult: { kondisi: 'NORMAL', confidence: 88.6, reasoning: 'Beban motor meningkat akibat objek besar, namun masih dalam batas operasional normal.' },
  },
  WASPADA: {
    objectIndex: 2,
    machine: { rpm: 1290, arus: 1.37, getaran: 4.8, suhu: 48.4, motor_load: 85, status: 'WASPADA' },
    mlResult: { kondisi: 'WASPADA', confidence: 89.4, reasoning: 'Peningkatan beban motor terdeteksi bersamaan dengan kenaikan arus dan getaran. Kecepatan disesuaikan dari 1.480 RPM → 1.300 RPM.' },
  },
  KRITIS: {
    objectIndex: 2,
    machine: { rpm: 0, arus: 2.14, getaran: 8.2, suhu: 58.7, motor_load: 97, status: 'KRITIS' },
    mlResult: { kondisi: 'KRITIS', confidence: 96.8, reasoning: 'Kondisi motor kritis terdeteksi. Getaran dan arus jauh melampaui batas aman. Konveyor dihentikan sementara.' },
  },
};

let objCounter = 24;
const generateObjId = () => {
  objCounter++;
  return `OBJ-${String(objCounter).padStart(3, '0')}`;
};

const now = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
};

const INITIAL_MACHINES = [
  {
    id: 'MTR-01',
    name: 'Motor Konveyor Utama',
    tag: 'Belt Conveyor Drive',
    spec: 'AC Induction 5.5 kW / 400V / 3-Phase',
    location: 'Line 1 - Transfer Station',
    rpm: 1480,
    nominalRpm: 1500,
    arus: 0.84,
    nominalArus: 11.2,
    getaran: 2.1,
    maxGetaran: 4.5,
    suhu: 42.8,
    maxSuhu: 75.0,
    motor_load: 63,
    status: 'NORMAL',
    operatingHours: 4320,
    powerKw: 3.8,
    healthScore: 94,
    lastMaintenance: '2026-09-28',
    coolingStatus: 'Aktif (Fan 100%)',
    bearingType: 'SKF 6208-2Z Deep Groove',
  },
  {
    id: 'MTR-02',
    name: 'Motor Feeder & Crusher',
    tag: 'Raw Material Feed System',
    spec: 'Heavy Duty Induction 7.5 kW / 400V / 3-Phase',
    location: 'Line 1 - Infeed Hopper',
    rpm: 960,
    nominalRpm: 1000,
    arus: 1.45,
    nominalArus: 15.0,
    getaran: 2.8,
    maxGetaran: 4.5,
    suhu: 48.5,
    maxSuhu: 80.0,
    motor_load: 74,
    status: 'NORMAL',
    operatingHours: 3890,
    powerKw: 5.2,
    healthScore: 89,
    lastMaintenance: '2026-10-02',
    coolingStatus: 'Aktif (Fan 100%)',
    bearingType: 'FAG 22210 Spherical Roller',
  },
  {
    id: 'MTR-03',
    name: 'Motor Exhaust & Blower',
    tag: 'Cooling & Ventilation Fan',
    spec: 'High-Speed Blower 3.7 kW / 400V / 3-Phase',
    location: 'Line 1 - Extraction Duct',
    rpm: 2850,
    nominalRpm: 3000,
    arus: 0.65,
    nominalArus: 7.8,
    getaran: 1.8,
    maxGetaran: 3.5,
    suhu: 38.2,
    maxSuhu: 65.0,
    motor_load: 52,
    status: 'NORMAL',
    operatingHours: 5120,
    powerKw: 2.1,
    healthScore: 96,
    lastMaintenance: '2026-10-08',
    coolingStatus: 'Sirkulasi Alami + Forced Air',
    bearingType: 'NSK 6306-DDU',
  },
];

const initialObject = {
  id: 'OBJ-024',
  kelas: 'Balok Kecil',
  panjang: 100,
  lebar: 60,
  tinggi: 40,
  confidence: 98.2,
  timestamp: now(),
  status: 'LULUS',
  weight: 0.8,
};

const initialProduction = {
  output: 1248,
  reject: 18,
  target: 1500,
  rate: 42,
  currentOrder: 'JO-2026-014',
  orderProduct: 'Komponen Bracket A',
  startTime: '06:00:00',
};

const initialInventory = [
  { id: 'MAT-001', nama: 'Baja Lembaran', stok: 2400, minimum: 500, satuan: 'kg', usage_per_unit: 1.2 },
  { id: 'MAT-002', nama: 'Aluminium Batang', stok: 840, minimum: 200, satuan: 'pcs', usage_per_unit: 0.5 },
  { id: 'MAT-003', nama: 'Baut M8', stok: 12000, minimum: 3000, satuan: 'pcs', usage_per_unit: 4 },
  { id: 'MAT-004', nama: 'Pelumas Mesin', stok: 45, minimum: 10, satuan: 'liter', usage_per_unit: 0.02 },
  { id: 'MAT-005', nama: 'Kawat Las', stok: 180, minimum: 50, satuan: 'kg', usage_per_unit: 0.3 },
];

const initialMES = {
  jobs: [
    { id: 'JO-2026-014', produk: 'Komponen Bracket A', target: 1500, aktual: 1248, status: 'Berjalan' },
    { id: 'JO-2026-013', produk: 'Housing Motor B', target: 800, aktual: 800, status: 'Selesai' },
    { id: 'JO-2026-015', produk: 'Shaft Assembly C', target: 600, aktual: 0, status: 'Menunggu' },
  ],
};

const initialEnergy = {
  totalKwhToday: 450.4,
  avgPowerKw: 18.5,
  efficiencyVsBaseline: 4.2,
  costToday: 653080,
  co2SavedKg: 128.5,
  powerFactor: 0.94,
  peakDemandKw: 24.8,
  breakdown: [
    { id: 'MTR-01', name: 'Motor Konveyor Utama', kwh: 120.5, pct: 27, color: 'var(--accent-orange)' },
    { id: 'MTR-02', name: 'Motor Feeder & Crusher', kwh: 165.2, pct: 37, color: 'var(--accent-blue)' },
    { id: 'MTR-03', name: 'Motor Exhaust & Blower', kwh: 68.1, pct: 15, color: 'var(--accent-cyan)' },
    { id: 'AUX-01', name: 'Sistem Pendingin & Auxiliary', kwh: 96.6, pct: 21, color: '#8B5CF6' },
  ],
  hourlyHistory: [
    { time: '00:00', kwh: 12.2, baseline: 14.0 },
    { time: '02:00', kwh: 11.8, baseline: 14.0 },
    { time: '04:00', kwh: 13.5, baseline: 14.0 },
    { time: '06:00', kwh: 22.4, baseline: 24.5 },
    { time: '08:00', kwh: 38.6, baseline: 40.0 },
    { time: '10:00', kwh: 42.1, baseline: 44.0 },
    { time: '12:00', kwh: 34.5, baseline: 36.0 },
    { time: '14:00', kwh: 44.8, baseline: 46.5 },
    { time: '16:00', kwh: 41.2, baseline: 43.0 },
    { time: '18:00', kwh: 36.7, baseline: 38.0 },
    { time: '20:00', kwh: 28.3, baseline: 30.0 },
    { time: '22:00', kwh: 18.9, baseline: 20.0 },
  ],
};

const useFactoryStore = create((set, get) => ({
  // Auth
  auth: { isLoggedIn: false, role: null, username: null },
  login: (username, password) => {
    if (username === 'operator' && password === 'operator123') {
      set({ auth: { isLoggedIn: true, role: 'OPERATOR', username: 'operator' } });
      return true;
    }
    if (username === 'supervisor' && password === 'supervisor123') {
      set({ auth: { isLoggedIn: true, role: 'SUPERVISOR', username: 'supervisor' } });
      return true;
    }
    return false;
  },
  logout: () => set({ auth: { isLoggedIn: false, role: null, username: null } }),

  // Multi-Machine State
  machines: INITIAL_MACHINES.map(m => ({ ...m, timestamp: now() })),
  selectedMachineId: 'MTR-01',
  setSelectedMachineId: (id) => {
    const target = get().machines.find(m => m.id === id);
    if (target) {
      set({ selectedMachineId: id, machine: { ...target } });
    }
  },

  // Machine (Active / MTR-01 for backward compatibility)
  machine: { ...INITIAL_MACHINES[0], timestamp: now() },
  machineHistory: [],
  liveHistory: { 'MTR-01': [], 'MTR-02': [], 'MTR-03': [] },

  // Current Object
  currentObject: { ...initialObject },
  objectHistory: [],

  // Production
  production: { ...initialProduction },

  // Inventory
  inventory: initialInventory.map(i => ({ ...i })),

  // MES
  mes: { ...initialMES, jobs: initialMES.jobs.map(j => ({ ...j })) },

  // Energy Monitoring Data
  energy: { ...initialEnergy },

  // ML Result
  mlResult: { kondisi: 'NORMAL', confidence: 95.2, reasoning: 'Semua parameter motor dalam batas normal. Tidak ada anomali terdeteksi.' },

  // Mandor AI (Google Coral Edge TPU / ESP32 Controller)
  mandorAI: {
    status: 'NORMAL',
    pwm: 255,
    confidence: 100.0,
    engine: 'Google Coral Edge TPU (model_mandor_quant.tflite)',
    lastUpdate: null,
    sensitivity: [
      { feature: '1. Arus', range: '0.350 - 0.750 A', impact: 'KRITIS' },
      { feature: '2. Suhu', range: '42.10 - 48.70 °C', impact: 'KRITIS' },
      { feature: '3. RPM', range: '0.00 - 60.00 RPM', impact: 'KRITIS' },
      { feature: '4. Getaran', range: '7.80 - 11.37 mm/s', impact: 'KRITIS' },
    ],
  },
  setMandorAI: (data) => set(state => ({ mandorAI: { ...state.mandorAI, ...data } })),

  // System
  system: {
    mesStatus: 'ONLINE',
    erpStatus: 'ONLINE',
    lastSync: now(),
    isOnline: true,
  },
  setSystemOnline: (isOnline) => set(state => ({ system: { ...state.system, isOnline } })),

  // Events
  events: [
    { time: '09:28:41', message: 'MTR-01: Kecepatan nominal 1.480 RPM tercapai', type: 'Mesin', severity: 'info' },
    { time: '09:28:42', message: 'MTR-02: Feeder hopper beroperasi normal pada 960 RPM', type: 'Mesin', severity: 'info' },
    { time: '09:28:43', message: 'MTR-03: Blower ventilasi stabil pada 2.850 RPM', type: 'Mesin', severity: 'info' },
    { time: '09:28:44', message: 'Status semua motor: NORMAL (Total 3 unit online)', type: 'Mesin', severity: 'info' },
    { time: '09:28:45', message: 'Produksi +1 unit (Total: 1.248)', type: 'Produksi', severity: 'info' },
    { time: '09:28:40', message: 'Sinkronisasi telemetri 3 mesin berhasil', type: 'Sistem', severity: 'info' },
    { time: '09:28:38', message: 'MES tracking data diperbarui', type: 'MES', severity: 'info' },
    { time: '09:28:35', message: 'ERP inventory diperbarui', type: 'ERP', severity: 'info' },
    { time: '09:28:30', message: 'Energy Monitoring: Konsumsi rata-rata 18.5 kW stabil', type: 'Energi', severity: 'info' },
  ],

  // Conveyor
  conveyorRunning: true,
  conveyorSpeed: 1,

  // Demo
  currentScenario: 'NORMAL',
  simulationSpeed: 1,
  simulationPlaying: true,

  // OEE calculation
  getOEE: () => {
    const state = get();
    const p = state.production;
    const availability = 92.1;
    const performance = p.target > 0 ? Math.min(((p.output / p.target) * 100), 99) : 0;
    const quality = p.output > 0 ? (((p.output - p.reject) / p.output) * 100) : 100;
    const oee = (availability * performance * quality) / 10000;
    return { availability, performance: parseFloat(performance.toFixed(1)), quality: parseFloat(quality.toFixed(1)), oee: parseFloat(oee.toFixed(1)) };
  },

  // Actions
  addEvent: (message, type, severity = 'info') => {
    set(state => ({
      events: [{ time: now(), message, type, severity }, ...state.events].slice(0, 100),
    }));
  },

  addProduction: () => {
    const state = get();
    if (state.machine.status === 'KRITIS') return;
    const newOutput = state.production.output + 1;
    set(state => ({
      production: { ...state.production, output: newOutput },
      inventory: state.inventory.map(item => ({
        ...item,
        stok: Math.max(0, item.stok - item.usage_per_unit),
      })),
      mes: {
        ...state.mes,
        jobs: state.mes.jobs.map(j =>
          j.id === state.production.currentOrder ? { ...j, aktual: newOutput } : j
        ),
      },
      energy: {
        ...state.energy,
        totalKwhToday: parseFloat((state.energy.totalKwhToday + 0.12).toFixed(1)),
      }
    }));
    get().addEvent(`Produksi +1 unit (Total: ${newOutput.toLocaleString('id-ID')})`, 'Produksi');
    get().addEvent('ERP inventory diperbarui', 'ERP');
    get().updateSync();
  },

  addReject: () => {
    const state = get();
    const newReject = state.production.reject + 1;
    set({ production: { ...state.production, reject: newReject } });
    get().addEvent(`Reject +1 (Total: ${newReject})`, 'Produksi', 'warning');
  },

  detectObject: (objectIndex) => {
    const cls = OBJECT_CLASSES[objectIndex];
    const newObj = {
      id: generateObjId(),
      kelas: cls.kelas,
      panjang: cls.panjang,
      lebar: cls.lebar,
      tinggi: cls.tinggi,
      confidence: parseFloat((95 + Math.random() * 4.5).toFixed(1)),
      timestamp: now(),
      status: 'LULUS',
      weight: cls.weight,
      diameter: cls.diameter,
    };
    set(state => ({
      currentObject: newObj,
      objectHistory: [newObj, ...state.objectHistory].slice(0, 50),
    }));
    get().addEvent(`Material terdeteksi: ${newObj.kelas} (${newObj.panjang} × ${newObj.lebar} × ${newObj.tinggi} mm)`, 'Produksi');
    get().updateSync();
  },

  updateMachineById: (id, params) => {
    set(state => {
      const updatedMachines = state.machines.map(m =>
        m.id === id ? { ...m, ...params, timestamp: now() } : m
      );
      const active = updatedMachines.find(m => m.id === state.selectedMachineId) || updatedMachines[0];
      return {
        machines: updatedMachines,
        machine: active,
      };
    });
  },

  updateMachine: (params) => {
    const state = get();
    get().updateMachineById(state.selectedMachineId || 'MTR-01', params);
  },

  updateSync: () => {
    set(state => ({
      system: { ...state.system, lastSync: now() },
    }));
  },

  setConveyorRunning: (running) => set({ conveyorRunning: running }),
  setSimulationSpeed: (speed) => {
    set({ simulationSpeed: speed });
    get().addEvent(`Kecepatan simulasi diatur ke ${speed}x`, 'Sistem', 'info');
  },
  setSimulationPlaying: (playing) => {
    set({ simulationPlaying: playing });
    get().addEvent(playing ? 'Simulasi dilanjutkan (PLAY)' : 'Simulasi dijeda (PAUSED)', 'Sistem', 'info');
  },

  recordSensorScan: (customObj) => {
    const state = get();
    if (state.machine.status === 'KRITIS') return;

    let obj = customObj;
    if (!obj) {
      const cls = OBJECT_CLASSES[Math.floor(Math.random() * OBJECT_CLASSES.length)];
      obj = {
        id: generateObjId(),
        kelas: cls.kelas,
        panjang: cls.panjang,
        lebar: cls.lebar,
        tinggi: cls.tinggi,
        confidence: parseFloat((95 + Math.random() * 4.5).toFixed(1)),
        timestamp: now(),
        status: 'LULUS',
        weight: cls.weight,
        diameter: cls.diameter,
      };
    }

    const newOutput = state.production.output + 1;
    const updatedInventory = state.inventory.map(item => ({
      ...item,
      stok: Math.max(0, item.stok - item.usage_per_unit),
    }));

    const updatedJobs = state.mes.jobs.map(j =>
      j.id === state.production.currentOrder ? { ...j, aktual: newOutput } : j
    );

    const energyIncrement = parseFloat((0.08 * (state.simulationSpeed || 1)).toFixed(2));
    const updatedTotalKwh = parseFloat((state.energy.totalKwhToday + energyIncrement).toFixed(1));

    set(state => ({
      currentObject: obj,
      objectHistory: [obj, ...state.objectHistory].slice(0, 50),
      production: { ...state.production, output: newOutput },
      inventory: updatedInventory,
      mes: { ...state.mes, jobs: updatedJobs },
      energy: { ...state.energy, totalKwhToday: updatedTotalKwh },
      system: { ...state.system, lastSync: now() },
    }));

    get().addEvent(`Zona Sensor: ${obj.id} (${obj.kelas}) terverifikasi — Produksi +1 unit dicatat`, 'Produksi');
    get().addEvent('ERP inventory diperbarui otomatis', 'ERP');
  },

  tickSimulation: () => {
    const state = get();
    if (!state.simulationPlaying) return;

    // If conveyor panel is NOT active on-screen (e.g. user is on Monitoring or MES page),
    // simulate background production passage:
    if (!window.__CONVEYOR_ACTIVE__ && state.conveyorRunning && state.machine.status !== 'KRITIS') {
      get().recordSensorScan();
    }

    // Telemetry micro-fluctuations on machines
    if (state.conveyorRunning && state.machine.status !== 'KRITIS') {
      const updatedMachines = state.machines.map(m => {
        if (m.status === 'KRITIS') return m;
        const rpmNoise = (Math.random() - 0.5) * 6;
        const arusNoise = (Math.random() - 0.5) * 0.03;
        const getaranNoise = (Math.random() - 0.5) * 0.08;
        const suhuNoise = (Math.random() - 0.5) * 0.15;
        return {
          ...m,
          rpm: Math.round(m.nominalRpm * (m.motor_load / 100) + rpmNoise),
          arus: parseFloat(Math.max(0.2, m.arus + arusNoise).toFixed(2)),
          getaran: parseFloat(Math.max(0.5, m.getaran + getaranNoise).toFixed(1)),
          suhu: parseFloat(Math.max(25, m.suhu + suhuNoise).toFixed(1)),
          timestamp: now(),
        };
      });

      const activeMachine = updatedMachines.find(m => m.id === state.selectedMachineId) || updatedMachines[0];
      set({ machines: updatedMachines, machine: activeMachine });
    }
  },

  // Scenario Execution
  runScenario: (scenarioName) => {
    const scenario = SCENARIOS[scenarioName];
    if (!scenario) return;

    // Detect object
    get().detectObject(scenario.objectIndex);

    // Update MTR-01
    get().updateMachineById('MTR-01', scenario.machine);

    // Update secondary machines realistically
    if (scenarioName === 'WASPADA') {
      get().updateMachineById('MTR-02', {
        motor_load: 80,
        arus: 1.62,
        getaran: 3.2,
        suhu: 51.0,
        status: 'WASPADA',
      });
      get().updateMachineById('MTR-03', {
        rpm: 2950,
        motor_load: 65,
        suhu: 40.5,
        status: 'NORMAL',
      });
    } else if (scenarioName === 'KRITIS') {
      get().updateMachineById('MTR-02', {
        rpm: 0,
        motor_load: 0,
        status: 'WASPADA',
      });
      get().updateMachineById('MTR-03', {
        rpm: 3000,
        motor_load: 75,
        status: 'NORMAL',
      });
    } else if (scenarioName === 'OBJEK_BESAR') {
      get().updateMachineById('MTR-02', {
        motor_load: 78,
        arus: 1.52,
        status: 'NORMAL',
      });
    } else {
      // NORMAL
      INITIAL_MACHINES.forEach(m => {
        get().updateMachineById(m.id, {
          rpm: m.rpm,
          arus: m.arus,
          getaran: m.getaran,
          suhu: m.suhu,
          motor_load: m.motor_load,
          status: m.status,
        });
      });
    }

    // Update ML result
    set({ mlResult: scenario.mlResult, currentScenario: scenarioName });

    // Machine status events
    get().addEvent(`MTR-01 Load: ${scenario.machine.motor_load}% | Status: ${scenario.machine.status}`, 'Mesin',
      scenario.machine.motor_load > 90 ? 'critical' : scenario.machine.motor_load > 80 ? 'warning' : 'info');

    // Closed-loop actions
    if (scenarioName === 'WASPADA') {
      get().addEvent('Kecepatan MTR-01 disesuaikan dari 1.480 RPM → 1.300 RPM', 'Mesin', 'warning');
      set({ conveyorRunning: true });
    } else if (scenarioName === 'KRITIS') {
      get().addEvent('KONVEYOR DIHENTIKAN SEMENTARA (Interlock Aktif)', 'Mesin', 'critical');
      get().addEvent('Alarm MTR-01 aktif — getaran & arus melebihi ambang batas', 'Mesin', 'critical');
      set({ conveyorRunning: false });
      get().addEvent('MES: Status workstation MTR-01 diubah ke KRITIS', 'MES', 'critical');
    } else {
      set({ conveyorRunning: true });
    }

    get().updateSync();
  },

  resetSimulation: () => {
    objCounter = 24;
    set({
      machines: INITIAL_MACHINES.map(m => ({ ...m, timestamp: now() })),
      machine: { ...INITIAL_MACHINES[0], timestamp: now() },
      selectedMachineId: 'MTR-01',
      machineHistory: [],
      currentObject: { ...initialObject, timestamp: now() },
      objectHistory: [],
      production: { ...initialProduction },
      inventory: initialInventory.map(i => ({ ...i })),
      mes: { ...initialMES, jobs: initialMES.jobs.map(j => ({ ...j })) },
      energy: { ...initialEnergy },
      mlResult: { kondisi: 'NORMAL', confidence: 95.2, reasoning: 'Semua parameter motor dalam batas normal. Tidak ada anomali terdeteksi.' },
      system: { mesStatus: 'ONLINE', erpStatus: 'ONLINE', lastSync: now(), isOnline: true },
      events: [{ time: now(), message: 'Simulasi dan telemetri mesin direset', type: 'Sistem', severity: 'info' }],
      conveyorRunning: true,
      conveyorSpeed: 1,
      currentScenario: 'NORMAL',
      simulationSpeed: 1,
      simulationPlaying: true,
      liveHistory: { 'MTR-01': [], 'MTR-02': [], 'MTR-03': [] },
    });
  },

  pushLiveTelemetryPoint: (machineId, point) => {
    const id = machineId || 'MTR-01';
    set(state => {
      const existing = state.liveHistory?.[id] || [];
      const updated = [...existing, point].slice(-30);
      return {
        liveHistory: {
          ...state.liveHistory,
          [id]: updated,
        }
      };
    });
  },

  // Time-series data for charts (supports machineId)
  getTimeSeriesData: (machineId) => {
    const state = get();
    const id = machineId || state.selectedMachineId || 'MTR-01';
    const live = state.liveHistory?.[id];
    if (live && live.length >= 3) {
      return live;
    }

    const target = state.machines.find(m => m.id === id) || state.machine;
    const points = [];
    
    // Variance factors based on machine
    const rpmVariance = id === 'MTR-03' ? 60 : id === 'MTR-02' ? 25 : 40;
    const arusVariance = id === 'MTR-02' ? 0.2 : 0.12;

    for (let i = 29; i >= 0; i--) {
      const t = new Date(Date.now() - i * 2000);
      const label = `${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}:${String(t.getSeconds()).padStart(2,'0')}`;
      const variance = (field, range) => {
        if (i === 0) return target[field];
        return target[field] + (Math.random() - 0.5) * range;
      };
      points.push({
        time: label,
        rpm: Math.round(variance('rpm', rpmVariance)),
        arus: parseFloat(variance('arus', arusVariance).toFixed(2)),
        getaran: parseFloat(variance('getaran', 0.5).toFixed(1)),
        suhu: parseFloat(variance('suhu', 1.2).toFixed(1)),
      });
    }
    return points;
  },
}));

export { OBJECT_CLASSES, SCENARIOS, INITIAL_MACHINES };
export default useFactoryStore;
