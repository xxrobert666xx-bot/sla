'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// --- DATOS PREDEFINIDOS PARA EL CONFIGURADOR ---
const DATA = {
  services: {
    Finanzas: [
      "Módulo de Cierre de Mes",
      "Conciliación Bancaria Diaria",
      "Generación de Reportes Financieros"
    ],
    Logística: [
      "Carga de Pedidos Matutina",
      "Consulta de Inventario en Tiempo Real",
      "Procesamiento de Despachos"
    ]
  },
  criticalHours: [
    "Últimos 3 y primeros 3 días del mes (08:00 - 22:00)",
    "Lunes a Sábado (06:00 - 12:00 PM)",
    "Lunes a Viernes (08:00 - 18:00)",
    "24/7 (Misión Crítica Absoluta)"
  ],
  targetAvailability: ["99.0", "99.5", "99.9", "99.99"],
  targetPerformance: [
    "< 2 segundos por transacción",
    "< 5 segundos por transacción",
    "< 10 segundos en reportes pesados",
    "Máximo 1 minuto de procesamiento"
  ],
  penalties: [
    "5% del ppto. de capacitación de TI se destina a mejoras del ERP",
    "Penalización del 10% en el presupuesto de bonos del equipo TI",
    "Asignación de 2 recursos dedicados de TI por 1 semana",
    "Escalamiento inmediato a Comité Directivo de TI"
  ]
};

// Colores para el gráfico circular
const COLORS = ['#059669', '#2563eb']; // Emerald para Finanzas, Azul para Logística

export default function SlaDashboard() {
  const [slas, setSlas] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // Para evitar errores de hidratación con gráficos
  
  const [formData, setFormData] = useState({
    department: 'Finanzas',
    serviceName: DATA.services['Finanzas'][0],
    criticalHours: DATA.criticalHours[0],
    availabilityKpi: 'Uptime del sistema (%)',
    performanceKpi: 'Tiempo de respuesta',
    targetAvailability: DATA.targetAvailability[1],
    targetPerformance: DATA.targetPerformance[1],
    penaltyRule: DATA.penalties[0]
  });

  useEffect(() => {
    setIsMounted(true);
    fetch('/api/slas')
      .then(res => res.json())
      .then(data => setSlas(data));
  }, []);

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDept = e.target.value as 'Finanzas' | 'Logística';
    setFormData({
      ...formData,
      department: newDept,
      serviceName: DATA.services[newDept][0]
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await fetch('/api/slas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        targetAvailability: parseFloat(formData.targetAvailability)
      })
    });
    
    if (res.ok) {
      const newSla = await res.json();
      setSlas([...slas, newSla]);
    }
    setIsSubmitting(false);
  };

  // --- LÓGICA DEL DASHBOARD Y GRÁFICOS ---
  const totalSlas = slas.length;
  
  const slasFinanzas = slas.filter((sla: any) => sla.department === 'Finanzas');
  const slasLogistica = slas.filter((sla: any) => sla.department === 'Logística');
  
  const finanzasCount = slasFinanzas.length;
  const logisticaCount = slasLogistica.length;
  
  const avgAvailability = totalSlas > 0 
    ? (slas.reduce((acc, curr: any) => acc + curr.targetAvailability, 0) / totalSlas).toFixed(2)
    : '0.00';

  const finanzasAvg = finanzasCount > 0 
    ? (slasFinanzas.reduce((acc, curr: any) => acc + curr.targetAvailability, 0) / finanzasCount).toFixed(2)
    : 0;

  const logisticaAvg = logisticaCount > 0 
    ? (slasLogistica.reduce((acc, curr: any) => acc + curr.targetAvailability, 0) / logisticaCount).toFixed(2)
    : 0;

  // Datos para los gráficos
  const pieData = [
    { name: 'Finanzas', value: finanzasCount },
    { name: 'Logística', value: logisticaCount }
  ];

  const barData = [
    { name: 'Finanzas', Disponibilidad: parseFloat(finanzasAvg as string) },
    { name: 'Logística', Disponibilidad: parseFloat(logisticaAvg as string) }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <nav className="bg-indigo-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-wide">Comercializadora Global S.A.</h1>
          <span className="text-sm bg-indigo-500/50 px-3 py-1 rounded-full font-medium border border-indigo-400">
            SLA Builder Pro
          </span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-extrabold text-slate-900">Ventana principal</h2>
        </div>

        {/* --- TARJETAS DE KPI --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Acuerdos</span>
            <span className="text-3xl font-extrabold text-indigo-700">{totalSlas}</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">SLAs Finanzas</span>
            <span className="text-3xl font-extrabold text-emerald-600">{finanzasCount}</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">SLAs Logística</span>
            <span className="text-3xl font-extrabold text-blue-600">{logisticaCount}</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Promedio Disponibilidad</span>
            <span className="text-3xl font-extrabold text-slate-700">{avgAvailability}%</span>
          </div>
        </div>

        {/* --- SECCIÓN DE GRÁFICOS (NUEVO) --- */}
        {isMounted && totalSlas > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Gráfico 1: Distribución */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-64 flex flex-col">
              <span className="text-slate-600 text-sm font-bold mb-2">Distribución de Acuerdos por Departamento</span>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-emerald-600"></div>Finanzas</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-600"></div>Logística</span>
              </div>
            </div>

            {/* Gráfico 2: Disponibilidad Promedio */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-64 flex flex-col">
              <span className="text-slate-600 text-sm font-bold mb-2">Disponibilidad Promedio Objetivo (%)</span>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{fontSize: 12}} />
                    <YAxis domain={['dataMin - 0.5', 100]} tick={{fontSize: 12}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} />
                    <Bar dataKey="Disponibilidad" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* --- FORMULARIO Y TABLA --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Formulario / Configurador (Ocupa 4 columnas) */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-5 pb-3 border-b border-slate-100 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                Parámetros del Acuerdo
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">1. Departamento</label>
                    <select className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.department} onChange={handleDepartmentChange}>
                      <option value="Finanzas">Finanzas</option>
                      <option value="Logística">Logística</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">2. Servicio Crítico</label>
                    <select className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.serviceName} onChange={e => setFormData({...formData, serviceName: e.target.value})}>
                      {DATA.services[formData.department as 'Finanzas' | 'Logística'].map(srv => (
                        <option key={srv} value={srv}>{srv}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">3. Ventana Crítica de SLA</label>
                  <select className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.criticalHours} onChange={e => setFormData({...formData, criticalHours: e.target.value})}>
                    {DATA.criticalHours.map(hr => <option key={hr} value={hr}>{hr}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Meta Disp. (%)</label>
                    <select className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.targetAvailability} onChange={e => setFormData({...formData, targetAvailability: e.target.value})}>
                      {DATA.targetAvailability.map(ta => <option key={ta} value={ta}>{ta}%</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Meta Desempeño</label>
                    <select className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.targetPerformance} onChange={e => setFormData({...formData, targetPerformance: e.target.value})}>
                      {DATA.targetPerformance.map(tp => <option key={tp} value={tp}>{tp}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">4. Penalización</label>
                  <select className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.penaltyRule} onChange={e => setFormData({...formData, penaltyRule: e.target.value})}>
                    {DATA.penalties.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <button type="submit" disabled={isSubmitting}
                  className="w-full mt-4 bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50">
                  {isSubmitting ? 'Registrando...' : 'Registrar SLA'}
                </button>
              </form>
            </div>
          </div>

          {/* Tabla de Resultados */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-800">Directorio de Acuerdos Activos</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-100 text-slate-600 uppercase text-xs tracking-wider">
                    <tr>
                      <th className="px-5 py-4 font-bold">Servicio / Depto</th>
                      <th className="px-5 py-4 font-bold">Horario Crítico</th>
                      <th className="px-5 py-4 font-bold">Objetivos de Servicio</th>
                      <th className="px-5 py-4 font-bold">Remedio Aplicable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {slas.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-16 text-center text-slate-400">
                          No hay acuerdos formalizados.
                        </td>
                      </tr>
                    ) : (
                      slas.map((sla: any) => (
                        <tr key={sla.id} className="hover:bg-indigo-50/30 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-800">{sla.serviceName}</div>
                            <div className="text-indigo-600 font-medium text-xs mt-1">{sla.department}</div>
                          </td>
                          <td className="px-5 py-4 text-slate-600 text-xs">
                            {sla.criticalHours}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-col gap-2">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                {sla.targetAvailability}% Disp.
                              </span>
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 w-fit">
                                ⏱ {sla.targetPerformance}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4 whitespace-normal min-w-[220px]">
                            <p className="text-slate-600 text-xs leading-relaxed bg-amber-50/50 p-2.5 rounded-lg border border-amber-100/50">
                              {sla.penaltyRule}
                            </p>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}