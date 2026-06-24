import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/use-auth';
import { supabase } from '../../lib/supabase';
import { 
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Sun, Moon, RotateCcw,
  Upload, Activity, Shield, AlertTriangle, AlertOctagon, CheckCircle2
} from 'lucide-react';
import './VisualAid.css';

// Types
interface Horse {
  id: string;
  name: string;
  owner: string;
  patient_id: string;
}

interface Scan {
  id: string;
  horse_id: string;
  hoof: 'FL' | 'FR' | 'HL' | 'HR';
  view: string;
  modality: string;
  description: string;
  scan_date: string;
  image_url: string;
}

interface Pin {
  id: number;
  x: number;
  y: number;
  label: string;
  category: 'rotation' | 'sinking' | 'chronic';
  descriptions: Record<string, string>;
}

// Pin data with severity-adaptive descriptions
const PIN_DATA: Pin[] = [
  { id: 1, x: 30, y: 20, label: 'HPA', category: 'rotation', descriptions: {
    normal: 'Horn-Papillary Angle: Normal ~20°',
    mild: 'HPA: Slight increase to 25°',
    moderate: 'HPA: Increased to 30°',
    severe: 'HPA: Severely increased >35°'
  }},
  { id: 2, x: 50, y: 15, label: 'P3', category: 'rotation', descriptions: {
    normal: 'P3 Rotation: Normal alignment',
    mild: 'P3: Mild rotation detected',
    moderate: 'P3: Moderate rotation 5-10°',
    severe: 'P3: Severe rotation >10°'
  }},
  { id: 3, x: 70, y: 25, label: 'SD', category: 'sinking', descriptions: {
    normal: 'Sole Depth: Normal 15-20mm',
    mild: 'Sole Depth: Slightly reduced 12-15mm',
    moderate: 'Sole Depth: Reduced 8-12mm',
    severe: 'Sole Depth: Severely reduced <8mm'
  }},
  { id: 4, x: 25, y: 40, label: 'PA', category: 'rotation', descriptions: {
    normal: 'Palmar Angle: Normal 3-5°',
    mild: 'Palmar Angle: Increased to 8°',
    moderate: 'Palmar Angle: Increased to 12°',
    severe: 'Palmar Angle: Severely increased >15°'
  }},
  { id: 5, x: 55, y: 45, label: 'FD', category: 'sinking', descriptions: {
    normal: 'Founder Distance: Normal <5mm',
    mild: 'Founder Distance: Slight 5-10mm',
    moderate: 'Founder Distance: Moderate 10-15mm',
    severe: 'Founder Distance: Severe >15mm'
  }},
  { id: 6, x: 75, y: 50, label: 'LW', category: 'chronic', descriptions: {
    normal: 'Lamellar Width: Normal',
    mild: 'Lamellar Width: Slight widening',
    moderate: 'Lamellar Width: Moderate widening',
    severe: 'Lamellar Width: Severe disruption'
  }},
  { id: 7, x: 35, y: 60, label: 'CS', category: 'chronic', descriptions: {
    normal: 'Coffin Shape: Normal',
    mild: 'Coffin Shape: Mild remodeling',
    moderate: 'Coffin Shape: Moderate remodeling',
    severe: 'Coffin Shape: Severe deformation'
  }},
  { id: 8, x: 60, y: 65, label: 'DS', category: 'sinking', descriptions: {
    normal: 'Dorsal Surface: Smooth',
    mild: 'Dorsal Surface: Mild irregularity',
    moderate: 'Dorsal Surface: Moderate irregularity',
    severe: 'Dorsal Surface: Severe remodeling'
  }},
  { id: 9, x: 45, y: 75, label: 'VB', category: 'rotation', descriptions: {
    normal: 'Vascular Bundle: Normal',
    mild: 'Vascular Bundle: Mild compression',
    moderate: 'Vascular Bundle: Moderate compression',
    severe: 'Vascular Bundle: Severe compression'
  }},
  { id: 10, x: 65, y: 80, label: 'DL', category: 'chronic', descriptions: {
    normal: 'Digital Cushion: Normal',
    mild: 'Digital Cushion: Mild displacement',
    moderate: 'Digital Cushion: Moderate displacement',
    severe: 'Digital Cushion: Severe displacement'
  }},
];

// Severity configurations
const SEVERITY_CONFIG = {
  normal: { color: '#2ed573', glow: '0 0 10px rgba(46, 213, 115, 0.3)', label: 'NORMAL', icon: CheckCircle2 },
  mild: { color: '#ff9f43', glow: '0 0 10px rgba(255, 159, 67, 0.3)', label: 'MILD', icon: AlertTriangle },
  moderate: { color: '#ff6b81', glow: '0 0 10px rgba(255, 107, 129, 0.3)', label: 'MODERATE', icon: AlertOctagon },
  severe: { color: '#ff4757', glow: '0 0 15px rgba(255, 71, 87, 0.5)', label: 'SEVERE', icon: Activity },
};

export default function VisualAid() {
  const { user, role } = useAuth();
  const [horses, setHorses] = useState<Horse[]>([]);
  const [selectedHorse, setSelectedHorse] = useState<Horse | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);
  const [severity, setSeverity] = useState<string>('normal');
  const [selectedHoof, setSelectedHoof] = useState<string>('FR');
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [activePin, setActivePin] = useState<number | null>(null);
  const [pinFilter, setPinFilter] = useState<string>('all');
  const [uploading, setUploading] = useState(false);
  const [tooltip, setTooltip] = useState<{x: number, y: number, text: string} | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  // Load horses
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('horses')
        .select('*')
        .order('name');
      setHorses(data || []);
      if (data && data.length > 0) setSelectedHorse(data[0]);
      setLoading(false);
    })();
  }, []);

  // Load scans when horse or hoof changes
  useEffect(() => {
    if (!selectedHorse) return;
    (async () => {
      const { data } = await supabase
        .from('scans')
        .select('*')
        .eq('horse_id', selectedHorse.id)
        .eq('hoof', selectedHoof)
        .order('scan_date', { ascending: false });
      setScans(data || []);
      setSelectedScan(data && data.length > 0 ? data[0] : null);
    })();
  }, [selectedHorse, selectedHoof]);

  const handleUpload = async (file: File) => {
    if (!selectedHorse || !selectedHoof) return;
    setUploading(true);
    try {
      const path = `${selectedHorse.patient_id}/${selectedHoof}/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('xray-images')
        .upload(path, file);
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('xray-images')
        .getPublicUrl(path);
      
      const { error: dbError } = await supabase.from('scans').insert({
        horse_id: selectedHorse.id,
        hoof: selectedHoof,
        view: 'Lateral',
        modality: 'DX',
        description: `Upload ${file.name}`,
        scan_date: new Date().toISOString().split('T')[0],
        image_url: publicUrl,
      });
      if (dbError) throw dbError;
      
      // Refresh scans
      const { data } = await supabase
        .from('scans')
        .select('*')
        .eq('horse_id', selectedHorse.id)
        .eq('hoof', selectedHoof)
        .order('scan_date', { ascending: false });
      setScans(data || []);
      setSelectedScan(data && data.length > 0 ? data[0] : null);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const filteredPins = pinFilter === 'all' 
    ? PIN_DATA 
    : PIN_DATA.filter(p => p.category === pinFilter);

  const currentSeverity = SEVERITY_CONFIG[severity as keyof typeof SEVERITY_CONFIG];
  const SeverityIcon = currentSeverity.icon;

  if (loading) return (
    <div className="visual-aid-loading">
      <div className="loading-spinner"></div>
      <p>Initializing Medical Tricorder...</p>
    </div>
  );

  return (
    <div className="visual-aid-container">
      {/* Top Bar - Medical Tricorder Style */}
      <header className="visual-aid-header">
        <div className="header-left">
          <span className="header-chevron">◀</span>
          <h1 className="header-title">PTP-102 VISUAL AID</h1>
        </div>
        <div className="header-center">
          <span className="status-dot"></span>
          <span className="status-text">SYSTEM ONLINE</span>
        </div>
        <div className="header-right">
          <select 
            className="horse-select"
            value={selectedHorse?.id || ''}
            onChange={e => {
              const horse = horses.find(h => h.id === e.target.value);
              setSelectedHorse(horse || null);
            }}
          >
            {horses.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
          <div className="severity-badge" style={{ 
            color: currentSeverity.color,
            boxShadow: currentSeverity.glow 
          }}>
            <SeverityIcon className="badge-icon" />
            <span>{currentSeverity.label}</span>
          </div>
          <div className="user-info">
            <span className="user-role">{role?.toUpperCase()}</span>
            <span className="user-email">{user?.email}</span>
          </div>
        </div>
      </header>

      {/* Main Content - Split Screen */}
      <main className="visual-aid-main">
        {/* Left Panel - Reference Analysis */}
        <section className="panel reference-panel">
          <div className="panel-header">
            <h2 className="panel-title">REFERENCE ANALYSIS — LATEROMEDIAL VIEW</h2>
          </div>
          
          <div className="severity-selector">
            {Object.entries(SEVERITY_CONFIG).map(([key, config]) => (
              <button
                key={key}
                className={`severity-btn ${severity === key ? 'active' : ''}`}
                style={severity === key ? { 
                  color: config.color, 
                  borderColor: config.color,
                  boxShadow: config.glow 
                } : {}}
                onClick={() => setSeverity(key)}
              >
                <config.icon className="severity-icon" />
                <span>{config.label}</span>
              </button>
            ))}
          </div>

          <div className="image-viewer" ref={imageRef}>
            <div className="holographic-grid"></div>
            <img 
              src="/images/reference-xray.svg" 
              alt="Reference X-ray"
              className="xray-image"
              style={{ filter: `brightness(${brightness}%)` }}
            />
            <svg className="overlay-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Measurement lines based on severity */}
              {severity === 'normal' && (
                <>
                  <line x1="20" y1="30" x2="80" y2="30" stroke="#2ed573" strokeWidth="0.3" strokeDasharray="2,1" opacity="0.6"/>
                  <line x1="30" y1="50" x2="70" y2="50" stroke="#2ed573" strokeWidth="0.3" strokeDasharray="2,1" opacity="0.6"/>
                </>
              )}
              {severity === 'mild' && (
                <>
                  <line x1="20" y1="28" x2="80" y2="32" stroke="#ff9f43" strokeWidth="0.3" strokeDasharray="2,1" opacity="0.7"/>
                  <line x1="30" y1="48" x2="70" y2="52" stroke="#ff9f43" strokeWidth="0.3" strokeDasharray="2,1" opacity="0.7"/>
                </>
              )}
              {severity === 'moderate' && (
                <>
                  <line x1="20" y1="25" x2="80" y2="35" stroke="#ff6b81" strokeWidth="0.4" strokeDasharray="2,1" opacity="0.8"/>
                  <line x1="30" y1="45" x2="70" y2="55" stroke="#ff6b81" strokeWidth="0.4" strokeDasharray="2,1" opacity="0.8"/>
                  <line x1="40" y1="60" x2="60" y2="70" stroke="#ff6b81" strokeWidth="0.3" strokeDasharray="1,1" opacity="0.5"/>
                </>
              )}
              {severity === 'severe' && (
                <>
                  <line x1="20" y1="22" x2="80" y2="38" stroke="#ff4757" strokeWidth="0.5" strokeDasharray="2,1" opacity="0.9"/>
                  <line x1="30" y1="42" x2="70" y2="58" stroke="#ff4757" strokeWidth="0.5" strokeDasharray="2,1" opacity="0.9"/>
                  <line x1="40" y1="55" x2="60" y2="75" stroke="#ff4757" strokeWidth="0.4" strokeDasharray="1,1" opacity="0.7"/>
                  <line x1="50" y1="65" x2="50" y2="85" stroke="#ff4757" strokeWidth="0.3" strokeDasharray="1,1" opacity="0.5"/>
                </>
              )}
            </svg>
            
            {/* Pins */}
            <div className="pins-container">
              {filteredPins.map(pin => (
                <button
                  key={pin.id}
                  className={`pin ${activePin === pin.id ? 'active' : ''}`}
                  style={{ 
                    left: `${pin.x}%`, 
                    top: `${pin.y}%`,
                    color: currentSeverity.color,
                    boxShadow: activePin === pin.id ? currentSeverity.glow : 'none'
                  }}
                  onClick={() => setActivePin(activePin === pin.id ? null : pin.id)}
                  onMouseEnter={e => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltip({
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                      text: pin.descriptions[severity] || pin.descriptions.normal
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                >
                  <span className="pin-number">{pin.id}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pin Filters */}
          <div className="pin-filters">
            {['all', 'rotation', 'sinking', 'chronic'].map(f => (
              <button
                key={f}
                className={`filter-btn ${pinFilter === f ? 'active' : ''}`}
                onClick={() => setPinFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Sensor Readout */}
          <div className="sensor-readout">
            <div className="readout-header">ANATOMICAL READOUT</div>
            <div className="readout-items">
              <div className="readout-item">
                <span className="readout-label">P3 ROTATION</span>
                <span className="readout-value" style={{ color: currentSeverity.color }}>
                  {severity === 'normal' ? '2°' : severity === 'mild' ? '5°' : severity === 'moderate' ? '10°' : '15°+'}
                </span>
                <span className="readout-status" style={{ color: currentSeverity.color }}>
                  {severity === 'normal' ? 'NORMAL' : severity === 'mild' ? 'ELEVATED' : severity === 'moderate' ? 'ABNORMAL' : 'CRITICAL'}
                </span>
              </div>
              <div className="readout-item">
                <span className="readout-label">SOLE DEPTH</span>
                <span className="readout-value" style={{ color: currentSeverity.color }}>
                  {severity === 'normal' ? '18mm' : severity === 'mild' ? '14mm' : severity === 'moderate' ? '10mm' : '6mm'}
                </span>
                <span className="readout-status" style={{ color: currentSeverity.color }}>
                  {severity === 'normal' ? 'OPTIMAL' : severity === 'mild' ? 'REDUCED' : severity === 'moderate' ? 'COMPROMISED' : 'CRITICAL'}
                </span>
              </div>
              <div className="readout-item">
                <span className="readout-label">PALMAR ANGLE</span>
                <span className="readout-value" style={{ color: currentSeverity.color }}>
                  {severity === 'normal' ? '5°' : severity === 'mild' ? '8°' : severity === 'moderate' ? '12°' : '18°+'}
                </span>
                <span className="readout-status" style={{ color: currentSeverity.color }}>
                  {severity === 'normal' ? 'HEALTHY' : severity === 'mild' ? 'ELEVATED' : severity === 'moderate' ? 'ABNORMAL' : 'SEVERE'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Panel - Patient Scan */}
        <section className="panel patient-panel">
          <div className="panel-header">
            <h2 className="panel-title">PATIENT SCAN — {selectedHoof}</h2>
          </div>

          {/* Date Navigation */}
          <div className="date-nav">
            <button 
              className="date-btn"
              onClick={() => {
                const idx = scans.findIndex(s => s.id === selectedScan?.id);
                if (idx < scans.length - 1) setSelectedScan(scans[idx + 1]);
              }}
              disabled={scans.findIndex(s => s.id === selectedScan?.id) >= scans.length - 1}
            >
              <ChevronLeft className="nav-icon" />
            </button>
            <div className="date-display">
              <span className="date-text">
                {selectedScan ? new Date(selectedScan.scan_date).toLocaleDateString('en-GB', { 
                  day: 'numeric', month: 'long', year: 'numeric' 
                }) : 'No scan selected'}
              </span>
              <span className="scan-counter">
                {scans.length > 0 ? `SCAN ${scans.findIndex(s => s.id === selectedScan?.id) + 1}/${scans.length}` : 'NO SCANS'}
              </span>
            </div>
            <button 
              className="date-btn"
              onClick={() => {
                const idx = scans.findIndex(s => s.id === selectedScan?.id);
                if (idx > 0) setSelectedScan(scans[idx - 1]);
              }}
              disabled={scans.findIndex(s => s.id === selectedScan?.id) <= 0}
            >
              <ChevronRight className="nav-icon" />
            </button>
          </div>

          {/* Hoof Selector */}
          <div className="hoof-selector">
            {['FL', 'FR', 'HL', 'HR'].map(hoof => (
              <button
                key={hoof}
                className={`hoof-btn ${selectedHoof === hoof ? 'active' : ''}`}
                onClick={() => setSelectedHoof(hoof)}
              >
                <span className="hoof-label">{hoof}</span>
                <span className="hoof-name">
                  {hoof === 'FL' ? 'Front Left' : hoof === 'FR' ? 'Front Right' : hoof === 'HL' ? 'Hind Left' : 'Hind Right'}
                </span>
              </button>
            ))}
          </div>

          {/* Image Viewer */}
          <div className="image-viewer patient-viewer">
            {selectedScan?.image_url ? (
              <img 
                src={selectedScan.image_url}
                alt={`Patient scan ${selectedScan.scan_date}`}
                className="xray-image patient-image"
                style={{ 
                  transform: `scale(${zoom})`,
                  filter: `brightness(${brightness}%)`
                }}
              />
            ) : (
              <div 
                className="upload-zone"
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) handleUpload(file);
                }}
              >
                <Upload className="upload-icon" />
                <p>Drag & drop X-ray here or click to browse</p>
                <input 
                  type="file" 
                  accept="image/*,.dcm,.dicom"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                  }}
                  hidden
                />
                {uploading && <div className="upload-spinner">Uploading...</div>}
              </div>
            )}
          </div>

          {/* Image Controls */}
          <div className="image-controls">
            <button onClick={() => setZoom(z => Math.min(z + 0.2, 3))}><ZoomIn className="control-icon" /></button>
            <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}><ZoomOut className="control-icon" /></button>
            <button onClick={() => setBrightness(b => Math.min(b + 10, 150))}><Sun className="control-icon" /></button>
            <button onClick={() => setBrightness(b => Math.max(b - 10, 50))}><Moon className="control-icon" /></button>
            <button onClick={() => { setZoom(1); setBrightness(100); }}><RotateCcw className="control-icon" /></button>
          </div>

          {/* Timeline */}
          <div className="timeline">
            {scans.map((scan, idx) => (
              <button
                key={scan.id}
                className={`timeline-dot ${selectedScan?.id === scan.id ? 'active' : ''}`}
                onClick={() => setSelectedScan(scan)}
                title={scan.scan_date}
              />
            ))}
          </div>

          {/* Metadata Readout */}
          {selectedScan && (
            <div className="metadata-readout">
              <div className="readout-header">SCAN METADATA</div>
              <div className="readout-items">
                <div className="readout-item">
                  <span className="readout-label">HORSE</span>
                  <span className="readout-value">{selectedHorse?.name}</span>
                </div>
                <div className="readout-item">
                  <span className="readout-label">HOOF</span>
                  <span className="readout-value">{selectedScan.hoof} | {selectedScan.view}</span>
                </div>
                <div className="readout-item">
                  <span className="readout-label">MODALITY</span>
                  <span className="readout-value">{selectedScan.modality}</span>
                </div>
                <div className="readout-item">
                  <span className="readout-label">DATE</span>
                  <span className="readout-value">{selectedScan.scan_date}</span>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Tooltip */}
      {tooltip && (
        <div 
          className="tooltip"
          style={{ 
            left: tooltip.x, 
            top: tooltip.y - 10,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="tooltip-content">
            <Shield className="tooltip-icon" />
            <span>{tooltip.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}
