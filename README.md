# MAESTRO — Smart Factory & Industrial IoT Platform

[![React 19](https://img.shields.io/badge/React-19.3.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-Digital%20Twin-black?logo=threedotjs&logoColor=white)](https://threejs.org/)
[![MQTT](https://img.shields.io/badge/MQTT-WebSocket%20Secure-red?logo=mqtt&logoColor=white)](https://mqtt.org/)
[![Edge AI](https://img.shields.io/badge/Edge%20AI-Google%20Coral%20TPU-blue)](https://coral.ai/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**MAESTRO** (**M**anufacturing **E**xecution and **S**ynchronization **T**racker) adalah platform *Smart Factory* & *Industrial IoT (IIoT)* generasi baru yang dirancang untuk pemantauan telemetri real-time, kontrol otomasi, integrasi MES/ERP, dan pemeliharaan prediktif (*Predictive Maintenance*) bertenaga Edge AI (**Mandor AI** berbasis Google Coral Edge TPU & ESP32).

---

## Fitur Utama

- **Real-Time Telemetry Streaming (MQTT via WSS)**:
  - Streaming data sensor getaran, arus, kecepatan (RPM), dan suhu motor secara *real-time* via WebSocket Secure broker.
  - Multi-node monitoring untuk berbagai mesin industri (`MTR-01 Konveyor Utama`, `MTR-02 Feeder & Crusher`, `MTR-03 Exhaust Blower`).
- **Mandor AI & Predictive Maintenance (RCA)**:
  - Deteksi anomali pada tingkat edge menggunakan model kuantisasi TFLite (`model_mandor_quant.tflite`).
  - *Root Cause Analysis* (RCA) otomatis, penghitungan *Health Score*, dan estimasi waktu kegagalan (*Estimated Time to Failure* / ETF).
  - Intervensi proteksi otomatis via kendali PWM motor saat anomali terdeteksi.
- **Simulasi Interaktif & 3D Digital Twin**:
  - **2D Canvas Physics Engine**: Visualisasi konveyor real-time dengan sensor laser scanning dimensi objek (panjang, lebar, tinggi, berat).
  - **3D Digital Twin**: Visualisasi 3D WebGL Three.js (`@react-three/fiber` & `@react-three/drei`) untuk inspeksi fisik mesin.
- **MES & OEE Analytics**:
  - Pelacakan Job Order terintegrasi.
  - Pengukuran *Overall Equipment Effectiveness* (OEE) lengkap: *Availability*, *Performance*, dan *Quality*.
- **ERP & Inventory Management**:
  - Pelacakan stok bahan baku (pelat baja, aluminium, baut, pelumas mesin).
  - Sistem peringatan batas stok minimum dan kalkulasi estimasi biaya produksi.
- **AI Production Forecasting**:
  - Prediksi tren pesanan dan kebutuhan kapasitas produksi harian/mingguan.
- **Dual Operational Modes**:
  - **CONNECTED Mode**: Terhubung langsung ke hardware fisik (ESP32 & Coral AI) melalui MQTT broker.
  - **STANDALONE DEMO Mode**: Mode demonstrasi mandiri dengan pengatur skenario instan (*NORMAL*, *OBJEK BESAR*, *WASPADA*, *KRITIS*) dan kontrol kecepatan simulasi.
- **Role-Based Access Control (RBAC)**:
  - Hak akses terpisah untuk peran **OPERATOR** (pemantauan & kendali dasar) dan **SUPERVISOR** (analisis mendalam MES, ERP, & Forecasting).

---

## Arsitektur Sistem

```mermaid
graph TD
    subgraph Edge Layer (Hardware)
        ESP[ESP32 Microcontroller] -->|Sensors: Arus, Suhu, RPM, Getaran| MQTT_PUB[MQTT Publisher]
        CORAL[Google Coral Edge TPU] -->|Inference: model_mandor_quant.tflite| AI_AGENT[Mandor AI Agent]
    end

    subgraph Broker Layer
        MQTT_BROKER[EMQX MQTT Broker / WSS]
    end

    subgraph Frontend Application (MAESTRO)
        DP[DataProviderContext]
        STORE[Zustand factoryStore]
        UI[React 19 Dashboard UI]
        CANVAS[2D Physics Canvas & 3D Digital Twin]
    end

    MQTT_PUB -->|Topic: mesin/monitoring/data| MQTT_BROKER
    AI_AGENT -->|Topic: mesin/kontrol/perintah| MQTT_BROKER
    MQTT_BROKER -->|WebSocket Secure| DP
    DP --> STORE
    STORE --> UI
    STORE --> CANVAS
    UI -.->|Manual Override / Control| DP
    DP -.->|Publish PWM / Status| MQTT_BROKER
```

---

## Spesifikasi Topik MQTT

### 1. Data Telemetri Sensor
- **Topik**: `mesin/monitoring/data`
- **Format Payload (JSON)**:
  ```json
  {
    "arus": 0.84,
    "suhu_objek": 42.8,
    "kecepatan": 1480,
    "getaran": 2.1
  }
  ```

### 2. Perintah Kendali Mandor AI
- **Topik**: `mesin/kontrol/perintah`
- **Format Payload (JSON)**:
  ```json
  {
    "status": "NORMAL",
    "pwm": 255
  }
  ```
  *(Status: `NORMAL` | `WASPADA` | `KRITIS`)*

---

## Tech Stack

| Kategori | Teknologi |
| :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/) |
| **State Management** | [Zustand 5](https://github.com/pmndrs/zustand) |
| **IoT Protocol** | [MQTT.js 5](https://github.com/mqttjs/MQTT.js) (WebSocket Secure) |
| **3D Rendering** | [Three.js](https://threejs.org/) + [@react-three/fiber](https://r3f.docs.pmnd.rs/) + [@react-three/drei](https://github.com/pmndrs/drei) |
| **Visualisasi Data** | [Recharts 3](https://recharts.org/) |
| **Routing** | [React Router DOM 7](https://reactrouter.com/) |
| **Styling** | Vanilla CSS Industrial Dark Design System |
| **Icons** | [Lucide React](https://lucide.dev/) |

---

## Memulai (Getting Started)

### Prasyarat
- [Node.js](https://nodejs.org/) versi 18.x atau lebih baru
- `npm` atau `pnpm` / `yarn`

### Instalasi & Menjalankan

1. **Clone repositori**:
   ```bash
   git clone https://github.com/USERNAME/maestro-smart-factory.git
   cd maestro-smart-factory
   ```

2. **Install dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan development server**:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:5173`.

4. **Build untuk produksi**:
   ```bash
   npm run build
   ```

---

## Akun Demo (Credentials)

Sistem telah dilengkapi akun demo siap pakai:

| Role | Username | Password | Hak Akses |
| :--- | :--- | :--- | :--- |
| **Operator** | `operator` | `operator123` | Overview, Monitoring, Maint, Produksi, Laporan, Event, Pengaturan |
| **Supervisor** | `supervisor` | `supervisor123` | Akses penuh (termasuk MES, ERP, & Forecasting) |

---

## Struktur Folder

```text
maestro/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Gambar & ikon statis
│   ├── components/         # Komponen UI bersama
│   │   ├── AppShell.jsx    # Layout dashboard & navigasi sidebar
│   │   └── DemoPanel.jsx   # Kontrol skenario simulasi
│   ├── pages/              # Halaman modul sistem
│   │   ├── LandingPage.jsx             # Hero landing page
│   │   ├── LoginPage.jsx               # Halaman autentikasi
│   │   ├── OverviewPage.jsx            # Dashboard ringkasan & 2D canvas
│   │   ├── MonitoringPage.jsx          # Telemetri multi-mesin
│   │   ├── PredictiveMaintenancePage.jsx # Mandor AI & RCA
│   │   ├── ProduksiPage.jsx            # Pelacakan work order
│   │   ├── MESPage.jsx                 # OEE & job tracking
│   │   ├── ERPPage.jsx                 # Inventori bahan baku
│   │   ├── ProductionForecastingPage.jsx # Prediksi kebutuhan AI
│   │   ├── ReportsPage.jsx             # Ekspor laporan
│   │   ├── EventPage.jsx               # Log audit peristiwa
│   │   └── PengaturanPage.jsx          # Konfigurasi MQTT & broker
│   ├── store/              # State management & network layer
│   │   ├── factoryStore.js             # Zustand global state
│   │   └── DataProviderContext.jsx     # MQTT client & data provider
│   ├── App.jsx             # Router & konfigurasi rute
│   ├── index.css           # Design tokens & styling industri
│   └── main.jsx            # Entry point aplikasi
├── package.json
└── vite.config.js
```

---

## Lisensi

Project ini dilisensikan di bawah lisensi [MIT](LICENSE).
