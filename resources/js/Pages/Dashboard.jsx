import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Dashboard() {
  const { hotels = { data: [], links: [] }, cities = [], flash = {}, errors = {} } = usePage().props;

  const { data, setData, processing, reset, post } = useForm({
    name: '',
    city_id: '',
    nit: '',
    max_rooms: '',
    address: '',
    phone: '',
    email: '',
  });

  const [editingId, setEditingId] = useState(null);

  function resetForm() {
    reset('name', 'city_id', 'nit', 'max_rooms', 'address', 'phone', 'email');
    setEditingId(null);
  }

  function submit(e) {
    e.preventDefault();

    if (editingId) {
      // UPDATE
      router.put(`/hotels/${editingId}`, data, {
        onSuccess: () => resetForm(),
        preserveScroll: true,
      });
    } else {
      // CREATE
      post('/hotels', {
        onSuccess: () => resetForm(),
        preserveScroll: true,
      });
    }
  }

  const handlePage = (url) => {
    if (!url) return;
    router.get(url, {}, { preserveScroll: true, preserveState: true });
  };

  function onEditClick(h) {
    setEditingId(h.id);
    setData({
      name: h.name ?? '',
      city_id: h.city?.id ?? '',
      nit: h.nit ?? '',
      max_rooms: h.max_rooms ?? '',
      address: h.address ?? '',
      phone: h.phone ?? '',
      email: h.email ?? '',
    });
    // scroll al formulario (opcional)
    const formEl = document.getElementById('hotel-form');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <AuthenticatedLayout
      header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Panel de Control</h2>}
    >
      <Head title="Dashboard" />

      <div className="py-12">
        <div className="mx-auto max-w-screen-2xl sm:px-6 lg:px-8">
          {flash?.success && (
            <div className="mb-4 rounded border border-green-300 bg-green-50 px-4 py-2 text-green-800">
              {flash.success}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Lista de hoteles */}
            <div className="lg:col-span-2">
              <div className="overflow-hidden rounded-lg bg-white shadow">
                <div className="border-b px-4 py-3">
                  <h3 className="text-lg font-semibold">Hoteles creados</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nombre</th>
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Ciudad</th>
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">NIT</th>
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">#Habitaciones</th>
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Contacto</th>
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {hotels.data.length === 0 && (
                        <tr><td className="px-4 py-6 text-center text-gray-500" colSpan={6}>No hotels yet.</td></tr>
                      )}
                      {hotels.data.map((h) => (
                        <tr key={h.id}>
                          <td className="px-4 py-2">{h.name}</td>
                          <td className="px-4 py-2">{h.city?.name ?? '—'}</td>
                          <td className="px-4 py-2">{h.nit ?? '—'}</td>
                          <td className="px-4 py-2">{h.max_rooms ?? '—'}</td>
                          <td className="px-4 py-2">
                            <div className="text-sm text-gray-900">{h.phone ?? '—'}</div>
                            <div className="text-sm text-gray-500">{h.email ?? '—'}</div>
                            <div className="text-sm text-gray-500">{h.address ?? '—'}</div>
                          </td>
                          <td className="px-4 py-2 flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => onEditClick(h)}
                              className="rounded bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600"
                            >
                              Editar
                            </button>
                            <a
                              href={`/hotels/${h.id}/offers`}
                              className="rounded bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary"
                            >
                              Habitaciones
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                <div className="flex items-center justify-between border-t px-4 py-2">
                  <div className="text-sm text-gray-500">Mostrando {hotels.data.length} registros</div>
                  <div className="flex gap-1">
                    {hotels.links?.map((l, i) => (
                      <button
                        key={i}
                        disabled={!l.url}
                        onClick={() => handlePage(l.url)}
                        className={`rounded px-3 py-1 text-sm ${
                          l.active
                            ? 'bg-primary text-white'
                            : l.url
                            ? 'bg-white text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                        dangerouslySetInnerHTML={{ __html: l.label }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario: Crear/Editar hotel */}
            <div>
              <div className="sticky top-6 rounded-lg border bg-white p-4 shadow" id="hotel-form">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {editingId ? 'Editar Hotel' : 'Creación de Hotel'}
                  </h3>
                </div>

                <form onSubmit={submit} className="space-y-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Razón Social *</label>
                    <input
                      className="w-full rounded border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      required
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Ciudad</label>
                    <select
                      className="w-full rounded border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      value={data.city_id}
                      onChange={(e) => setData('city_id', e.target.value)}
                    >
                      <option value="">Seleccione una ciudad</option>
                      {cities.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    {errors.city_id && <p className="mt-1 text-sm text-red-600">{errors.city_id}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium">NIT</label>
                      <input
                        className="w-full rounded border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                        value={data.nit}
                        onChange={(e) => setData('nit', e.target.value)}
                      />
                      {errors.nit && <p className="mt-1 text-sm text-red-600">{errors.nit}</p>}
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Cantidad Habitaciones</label>
                      <input
                        type="number" min={0}
                        className="w-full rounded border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                        value={data.max_rooms}
                        onChange={(e) => setData('max_rooms', e.target.value === '' ? '' : Number(e.target.value))}
                      />
                      {errors.max_rooms && <p className="mt-1 text-sm text-red-600">{errors.max_rooms}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Dirección</label>
                    <input
                      className="w-full rounded border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      value={data.address}
                      onChange={(e) => setData('address', e.target.value)}
                    />
                    {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium">Teléfono</label>
                      <input
                        className="w-full rounded border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                      />
                      {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Correo Electrónico</label>
                      <input
                        type="email"
                        className="w-full rounded border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                      />
                      {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full rounded bg-primary px-4 py-2 text-white hover:bg-primary disabled:opacity-50"
                    >
                      {processing ? (editingId ? 'Actualizando…' : 'Guardando…') : (editingId ? 'Actualizar Hotel' : 'Crear Hotel')}
                    </button>

                    {editingId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="w-full rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
