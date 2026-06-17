import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/use-auth';
import {
  getShipments,
  createShipment,
  updateShipment,
  getBottlesForShipment,
  createBottle,
  updateBottle,
  getSites,
  getStorageForSite,
  createStorage,
} from '../../lib/api';
import { Plus, Package, Warehouse, Edit } from 'lucide-react';

type ShipmentStatus = 'pending' | 'in_transit' | 'delivered' | 'received' | 'discrepancy';
type BottleStatus = 'received' | 'stored' | 'dispensed' | 'returned' | 'destroyed';

const shipmentStatusColors: Record<ShipmentStatus, string> = {
  pending: 'bg-slate-900/30 text-slate-300',
  in_transit: 'bg-blue-900/30 text-blue-300',
  delivered: 'bg-green-900/30 text-green-300',
  received: 'bg-purple-900/30 text-purple-300',
  discrepancy: 'bg-red-900/30 text-red-300',
};

export default function Shipments() {
  const { /* role */ _ } = useAuth();
  const [shipments, setShipments] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState<any | null>(null);
  const [bottles, setBottles] = useState<any[]>([]);
  const [storageLogs, setStorageLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'shipments' | 'bottles' | 'storage'>('shipments');
  const [showModal, setShowModal] = useState(false);
  const [editingShipment, setEditingShipment] = useState<any | null>(null);
  const [showBottleModal, setShowBottleModal] = useState(false);
  const [editingBottle, setEditingBottle] = useState<any | null>(null);
  const [showStorageModal, setShowStorageModal] = useState(false);

  // Form state
  const [shipmentForm, setShipmentForm] = useState({
    site_id: '',
    batch_number: '',
    manufacturer: 'Canopus BioPharma',
    drug_name: 'PTP-102',
    strength: '100mg/mL',
    quantity_shipped: '',
    quantity_received: 0,
    shipment_date: new Date().toISOString().split('T')[0],
    expected_delivery: '',
    tracking_number: '',
    carrier: '',
    status: 'pending' as ShipmentStatus,
    temperature_log: '',
    notes: '',
  });

  const [bottleForm, setBottleForm] = useState({
    shipment_id: '',
    bottle_number: '',
    volume_ml: 10,
    concentration_mg_ml: 100,
    expiry_date: '',
    status: 'received' as BottleStatus,
    storage_location: '',
  });

  const [storageForm, setStorageForm] = useState({
    site_id: '',
    storage_type: 'refrigerator',
    temperature_c: 4,
    humidity_percent: 50,
    monitored_by: '',
    equipment_id: '',
    notes: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [shipmentsData, sitesData] = await Promise.all([
        getShipments(),
        getSites(),
      ]);
      setShipments(shipmentsData);
      setSites(sitesData);
    } catch (err) {
      console.error('Load data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleShipmentSelect = async (shipment: any) => {
    setSelectedShipment(shipment);
    setActiveTab('bottles');
    try {
      const [bottlesData, storageData] = await Promise.all([
        getBottlesForShipment(shipment.id),
        getStorageForSite(shipment.site_id),
      ]);
      setBottles(bottlesData);
      setStorageLogs(storageData);
    } catch (err) {
      console.error('Load shipment details error:', err);
    }
  };

  const handleShipmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingShipment) {
        await updateShipment(editingShipment.id, shipmentForm);
      } else {
        await createShipment(shipmentForm);
      }
      setShowModal(false);
      setEditingShipment(null);
      resetShipmentForm();
      loadData();
    } catch (err) {
      console.error('Save shipment error:', err);
      alert('Failed to save shipment');
    }
  };

  const resetShipmentForm = () => {
    setShipmentForm({
      site_id: '',
      batch_number: '',
      manufacturer: 'Canopus BioPharma',
      drug_name: 'PTP-102',
      strength: '100mg/mL',
      quantity_shipped: '',
      quantity_received: 0,
      shipment_date: new Date().toISOString().split('T')[0],
      expected_delivery: '',
      tracking_number: '',
      carrier: '',
      status: 'pending',
      temperature_log: '',
      notes: '',
    });
  };

  const handleBottleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBottle) {
        await updateBottle(editingBottle.id, bottleForm);
      } else {
        await createBottle(bottleForm);
      }
      setShowBottleModal(false);
      setEditingBottle(null);
      resetBottleForm();
      if (selectedShipment) {
        const bottlesData = await getBottlesForShipment(selectedShipment.id);
        setBottles(bottlesData);
      }
    } catch (err) {
      console.error('Save bottle error:', err);
      alert('Failed to save bottle');
    }
  };

  const resetBottleForm = () => {
    setBottleForm({
      shipment_id: selectedShipment?.id || '',
      bottle_number: '',
      volume_ml: 10,
      concentration_mg_ml: 100,
      expiry_date: '',
      status: 'received',
      storage_location: '',
    });
  };

  const handleStorageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createStorage(storageForm);
      setShowStorageModal(false);
      if (selectedShipment) {
        const storageData = await getStorageForSite(selectedShipment.site_id);
        setStorageLogs(storageData);
      }
    } catch (err) {
      console.error('Save storage error:', err);
      alert('Failed to save storage log');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">Drug Shipment & Inventory Management</h2>
          <p className="text-sm text-slate-400">Track PTP-102 drug supply chain — batch tracking, bottle-level inventory, temperature monitoring.</p>
        </div>
        <button onClick={() => { setEditingShipment(null); resetShipmentForm(); setShowModal(true); }} className="flex items-center gap-1.5 rounded bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-slate-200">
          <Plus className="h-4 w-4" />
          New Shipment
        </button>
      </div>

      <div className="border border-slate-800 rounded-md overflow-hidden">
        <div className="flex border-b border-slate-800">
          {['shipments', 'bottles', 'storage'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-slate-100 text-slate-100 bg-slate-900/50'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'shipments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/50 border-b border-slate-800">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Batch #</th>
                  <th className="px-3 py-2 text-left font-medium">Site</th>
                  <th className="px-3 py-2 text-left font-medium">Drug</th>
                  <th className="px-3 py-2 text-left font-medium">Qty Shipped</th>
                  <th className="px-3 py-2 text-left font-medium">Qty Received</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                  <th className="px-3 py-2 text-left font-medium">Ship Date</th>
                  <th className="px-3 py-2 text-left font-medium">Tracking</th>
                  <th className="px-3 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr><td colSpan={9} className="px-3 py-8 text-center text-slate-400">Loading...</td></tr>
                ) : shipments.length === 0 ? (
                  <tr><td colSpan={9} className="px-3 py-8 text-center text-slate-400">No shipments recorded</td></tr>
                ) : (
                  shipments.map(s => (
                    <tr key={s.id} className="hover:bg-slate-900/50 cursor-pointer" onClick={() => handleShipmentSelect(s)}>
                      <td className="px-3 py-2 font-mono text-slate-300">{s.batch_number}</td>
                      <td className="px-3 py-2">{s.sites?.name || 'N/A'}</td>
                      <td className="px-3 py-2">{s.drug_name} {s.strength}</td>
                      <td className="px-3 py-2">{s.quantity_shipped}</td>
                      <td className="px-3 py-2">{s.quantity_received}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs ${shipmentStatusColors[s.status as ShipmentStatus]}`}>
                          {s.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-400">{s.shipment_date ? new Date(s.shipment_date).toLocaleDateString() : '—'}</td>
                      <td className="px-3 py-2 font-mono text-xs text-slate-400">{s.tracking_number || '—'}</td>
                      <td className="px-3 py-2 text-right">
                        <button onClick={e => { e.stopPropagation(); setEditingShipment(s); setShipmentForm({...shipmentForm, ...s, expected_delivery: s.expected_delivery?.split('T')[0] || '', shipment_date: s.shipment_date?.split('T')[0] || '' }); setShowModal(true); }} className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-100"><Edit className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'bottles' && (
          <div className="p-4">
            {selectedShipment ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Bottles for Batch {selectedShipment.batch_number}</h3>
                  <button onClick={() => { setEditingBottle(null); resetBottleForm(); setShowBottleModal(true); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-100 text-sm font-medium text-slate-900 hover:bg-slate-200">
                    <Plus className="h-4 w-4" /> Add Bottle
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {bottles.map(b => (
                    <div key={b.id} className="border border-slate-800 rounded p-3 hover:bg-slate-900/50">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-slate-300">#{b.bottle_number}</span>
                        <span className={`px-1.5 py-0.5 rounded text-xs ${
                          b.status === 'received' ? 'bg-blue-900/30 text-blue-300' :
                          b.status === 'stored' ? 'bg-purple-900/30 text-purple-300' :
                          b.status === 'dispensed' ? 'bg-green-900/30 text-green-300' :
                          b.status === 'returned' ? 'bg-amber-900/30 text-amber-300' :
                          'bg-red-900/30 text-red-300'
                        }`}>{b.status}</span>
                      </div>
                      <div className="text-sm text-slate-400 mt-1 space-y-1">
                        <div>{b.volume_ml} mL @ {b.concentration_mg_ml} mg/mL</div>
                        <div>Expires: {b.expiry_date ? new Date(b.expiry_date).toLocaleDateString() : '—'}</div>
                        <div>Location: {b.storage_location || 'Not assigned'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center text-slate-400 py-8">
                <Package className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                <p>Select a shipment to view bottle inventory.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'storage' && (
          <div className="p-4">
            {selectedShipment ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Storage Monitoring — {selectedShipment.sites?.name}</h3>
                  <button onClick={() => setShowStorageModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-100 text-sm font-medium text-slate-900 hover:bg-slate-200">
                    <Plus className="h-4 w-4" /> Log Reading
                  </button>
                </div>
                <div className="space-y-2">
                  {storageLogs.map(s => (
                    <div key={s.id} className="border border-slate-800 rounded p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-mono">{s.storage_type}</span>
                          <span className="text-sm text-slate-300">{s.temperature_c}°C / {s.humidity_percent}% RH</span>
                        </div>
                        <div className="text-xs text-slate-400">
                          {s.created_at ? new Date(s.created_at).toLocaleString() : '—'} by {s.monitored_by}
                        </div>
                      </div>
                      {s.notes && <p className="text-sm text-slate-400 mt-1">{s.notes}</p>}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center text-slate-400 py-8">
                <Warehouse className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                <p>Select a shipment to view storage monitoring logs.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Shipment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => { setShowModal(false); setEditingShipment(null); resetShipmentForm(); }}>
          <form onSubmit={handleShipmentSubmit} className="bg-slate-900 border border-slate-800 rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-medium">{editingShipment ? 'Edit Shipment' : 'New Shipment'}</h3>
              <button type="button" onClick={() => { setShowModal(false); setEditingShipment(null); resetShipmentForm(); }} className="p-1 rounded hover:bg-slate-800">✕</button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="block"><span className="text-sm text-slate-300">Site *</span>
                  <select required value={shipmentForm.site_id} onChange={e => setShipmentForm({...shipmentForm, site_id: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm">
                    <option value="">Select site</option>
                    {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </label>
                <label className="block"><span className="text-sm text-slate-300">Batch Number *</span>
                  <input required value={shipmentForm.batch_number} onChange={e => setShipmentForm({...shipmentForm, batch_number: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
                </label>
                <label className="block"><span className="text-sm text-slate-300">Drug Name</span>
                  <input value={shipmentForm.drug_name} onChange={e => setShipmentForm({...shipmentForm, drug_name: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
                </label>
                <label className="block"><span className="text-sm text-slate-300">Strength</span>
                  <input value={shipmentForm.strength} onChange={e => setShipmentForm({...shipmentForm, strength: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
                </label>
                <label className="block"><span className="text-sm text-slate-300">Quantity Shipped *</span>
                  <input type="number" required value={shipmentForm.quantity_shipped} onChange={e => setShipmentForm({...shipmentForm, quantity_shipped: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
                </label>
                <label className="block"><span className="text-sm text-slate-300">Quantity Received</span>
                  <input type="number" value={shipmentForm.quantity_received} onChange={e => setShipmentForm({...shipmentForm, quantity_received: parseInt(e.target.value) || 0})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
                </label>
                <label className="block"><span className="text-sm text-slate-300">Shipment Date *</span>
                  <input type="date" required value={shipmentForm.shipment_date} onChange={e => setShipmentForm({...shipmentForm, shipment_date: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
                </label>
                <label className="block"><span className="text-sm text-slate-300">Expected Delivery</span>
                  <input type="date" value={shipmentForm.expected_delivery} onChange={e => setShipmentForm({...shipmentForm, expected_delivery: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
                </label>
                <label className="block"><span className="text-sm text-slate-300">Status *</span>
                  <select value={shipmentForm.status} onChange={e => setShipmentForm({...shipmentForm, status: e.target.value as ShipmentStatus})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm">
                    <option value="pending">Pending</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="received">Received</option>
                    <option value="discrepancy">Discrepancy</option>
                  </select>
                </label>
                <label className="block"><span className="text-sm text-slate-300">Tracking Number</span>
                  <input value={shipmentForm.tracking_number} onChange={e => setShipmentForm({...shipmentForm, tracking_number: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
                </label>
                <label className="block"><span className="text-sm text-slate-300">Carrier</span>
                  <input value={shipmentForm.carrier} onChange={e => setShipmentForm({...shipmentForm, carrier: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
                </label>
              </div>
              <label className="block"><span className="text-sm text-slate-300">Temperature Log (JSON or notes)</span>
                <textarea value={shipmentForm.temperature_log} onChange={e => setShipmentForm({...shipmentForm, temperature_log: e.target.value})} rows={2} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm font-mono text-xs" placeholder='{"min": 2, "max": 8, "unit": "C"}' />
              </label>
              <label className="block"><span className="text-sm text-slate-300">Notes</span>
                <textarea value={shipmentForm.notes} onChange={e => setShipmentForm({...shipmentForm, notes: e.target.value})} rows={2} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
              </label>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => { setShowModal(false); setEditingShipment(null); resetShipmentForm(); }} className="px-3 py-1.5 rounded border border-slate-800 text-sm hover:bg-slate-800">Cancel</button>
                <button type="submit" className="px-3 py-1.5 rounded bg-slate-100 text-sm font-medium text-slate-900 hover:bg-slate-200">
                  {editingShipment ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Bottle Modal */}
      {showBottleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => { setShowBottleModal(false); setEditingBottle(null); resetBottleForm(); }}>
          <form onSubmit={handleBottleSubmit} className="bg-slate-900 border border-slate-800 rounded-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-medium">{editingBottle ? 'Edit Bottle' : 'Add Bottle'}</h3>
              <button type="button" onClick={() => { setShowBottleModal(false); setEditingBottle(null); resetBottleForm(); }} className="p-1 rounded hover:bg-slate-800">✕</button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="block"><span className="text-sm text-slate-300">Bottle Number *</span>
                  <input required value={bottleForm.bottle_number} onChange={e => setBottleForm({...bottleForm, bottle_number: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
                </label>
                <label className="block"><span className="text-sm text-slate-300">Volume (mL) *</span>
                  <input type="number" step="0.1" required value={bottleForm.volume_ml} onChange={e => setBottleForm({...bottleForm, volume_ml: parseFloat(e.target.value)})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
                </label>
                <label className="block"><span className="text-sm text-slate-300">Concentration (mg/mL) *</span>
                  <input type="number" required value={bottleForm.concentration_mg_ml} onChange={e => setBottleForm({...bottleForm, concentration_mg_ml: parseFloat(e.target.value)})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
                </label>
                <label className="block"><span className="text-sm text-slate-300">Expiry Date *</span>
                  <input type="date" required value={bottleForm.expiry_date} onChange={e => setBottleForm({...bottleForm, expiry_date: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="block"><span className="text-sm text-slate-300">Status *</span>
                  <select value={bottleForm.status} onChange={e => setBottleForm({...bottleForm, status: e.target.value as BottleStatus})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm">
                    <option value="received">Received</option>
                    <option value="stored">Stored</option>
                    <option value="dispensed">Dispensed</option>
                    <option value="returned">Returned</option>
                    <option value="destroyed">Destroyed</option>
                  </select>
                </label>
                <label className="block"><span className="text-sm text-slate-300">Storage Location</span>
                  <input value={bottleForm.storage_location} onChange={e => setBottleForm({...bottleForm, storage_location: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => { setShowBottleModal(false); setEditingBottle(null); resetBottleForm(); }} className="px-3 py-1.5 rounded border border-slate-800 text-sm hover:bg-slate-800">Cancel</button>
                <button type="submit" className="px-3 py-1.5 rounded bg-slate-100 text-sm font-medium text-slate-900 hover:bg-slate-200">
                  {editingBottle ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Storage Modal */}
      {showStorageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowStorageModal(false)}>
          <form onSubmit={handleStorageSubmit} className="bg-slate-900 border border-slate-800 rounded-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-medium">Log Storage Reading</h3>
              <button type="button" onClick={() => setShowStorageModal(false)} className="p-1 rounded hover:bg-slate-800">✕</button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="block"><span className="text-sm text-slate-300">Storage Type *</span>
                  <select value={storageForm.storage_type} onChange={e => setStorageForm({...storageForm, storage_type: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm">
                    <option value="refrigerator">Refrigerator (2-8°C)</option>
                    <option value="freezer">Freezer (-20°C)</option>
                    <option value="ultra_low">Ultra-Low (-80°C)</option>
                    <option value="ambient">Ambient</option>
                  </select>
                </label>
                <label className="block"><span className="text-sm text-slate-300">Temperature (°C) *</span>
                  <input type="number" step="0.1" required value={storageForm.temperature_c} onChange={e => setStorageForm({...storageForm, temperature_c: parseFloat(e.target.value)})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
                </label>
                <label className="block"><span className="text-sm text-slate-300">Humidity (%)</span>
                  <input type="number" min="0" max="100" value={storageForm.humidity_percent} onChange={e => setStorageForm({...storageForm, humidity_percent: parseInt(e.target.value) || 0})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
                </label>
                <label className="block"><span className="text-sm text-slate-300">Equipment ID</span>
                  <input value={storageForm.equipment_id} onChange={e => setStorageForm({...storageForm, equipment_id: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
                </label>
              </div>
              <label className="block"><span className="text-sm text-slate-300">Monitored By *</span>
                <input required value={storageForm.monitored_by} onChange={e => setStorageForm({...storageForm, monitored_by: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
              </label>
              <label className="block"><span className="text-sm text-slate-300">Notes</span>
                <textarea value={storageForm.notes} onChange={e => setStorageForm({...storageForm, notes: e.target.value})} rows={2} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
              </label>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setShowStorageModal(false)} className="px-3 py-1.5 rounded border border-slate-800 text-sm hover:bg-slate-800">Cancel</button>
                <button type="submit" className="px-3 py-1.5 rounded bg-slate-100 text-sm font-medium text-slate-900 hover:bg-slate-200">Log Reading</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}