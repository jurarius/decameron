import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

// Normaliza texto para comparaciones (quita tildes)
function norm(s = '') {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}

// Helper para convertir IDs a number
const parseId = (v) => (v === '' ? '' : Number(v));

export default function Offers() {
  const {
    hotel = {},                 // { id, name, max_rooms }
    roomTypes = [],             // [{id,name}]
    accommodations = [],        // [{id,name}]
    offers = [],                // [{id, room_type_id, accommodation_id, quantity, base_price, ...}]
    flash = {},
    errors = {},
  } = usePage().props;

  const [editingId, setEditingId] = useState(null);

  const { data, setData, reset, processing } = useForm({
    hotel_id: hotel.id,
    room_type_id: '',
    accommodation_id: '',
    quantity: '',
    base_price: '',
  });

  // Reglas de negocio
  const RULES = useMemo(() => ({
    [norm('Estándar')]: [norm('Sencilla'), norm('Doble')],
    [norm('Junior')]:   [norm('Triple'), norm('Cuádruple')],
    [norm('Suite')]:    [norm('Sencilla'), norm('Doble'), norm('Triple')],
  }), []);

  // Mapas id->obj
  const roomTypeById = useMemo(
    () => Object.fromEntries(roomTypes.map(rt => [rt.id, rt])),
    [roomTypes]
  );
  const accommodationById = useMemo(
    () => Object.fromEntries(accommodations.map(a => [a.id, a])),
    [accommodations]
  );

  // Acomodaciones permitidas según tipo elegido
  const allowedAccommodations = useMemo(() => {
    if (!data.room_type_id) return accommodations;
    const rt = roomTypeById[data.room_type_id];
    const allowed = RULES[norm(rt?.name || '')] || [];
    return accommodations.filter(a => allowed.includes(norm(a.name)));
  }, [data.room_type_id, accommodations, roomTypeById, RULES]);

  // Si al cambiar el tipo, la acomodación ya no es válida → limpiar
  useEffect(() => {
    if (data.accommodation_id === '' || !allowedAccommodations.length) return;
    const stillValid = allowedAccommodations.some(a => a.id === data.accommodation_id);
    if (!stillValid) setData('accommodation_id', '');
  }, [allowedAccommodations, data.accommodation_id, setData]);

  function resetForm() {
    setEditingId(null);
    reset('room_type_id', 'accommodation_id', 'quantity', 'base_price');
    setData('hotel_id', hotel.id);
  }

  function onEditClick(o) {
    setEditingId(o.id);
    setData({
      hotel_id: hotel.id,
      room_type_id: o.room_type_id,
      accommodation_id: o.accommodation_id,
      quantity: o.quantity ?? '',
      base_price: o.base_price ?? '',
    });
    const el = document.getElementById('offer-form');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function onDelete(id) {
    if (!confirm('¿Eliminar esta combinación?')) return;
    router.delete(`/hotel-room-offers/${id}`, { preserveScroll: true });
  }

  function submit(e) {
    e.preventDefault();

    // 1) Validación cliente: reglas de tipo ↔ acomodación
    const rt = roomTypeById[data.room_type_id];
    const acc = accommodationById[data.accommodation_id];
    if (rt && acc) {
      const allowed = RULES[norm(rt.name)] || [];
      if (!allowed.includes(norm(acc.name))) {
        alert(`Acomodación "${acc.name}" no permitida para el tipo "${rt.name}".`);
        return;
      }
    }

    // 2) Validación cliente: no superar hotel.max_rooms con la suma propuesta
    const totalActual = offers.reduce((acc, o) => acc + (o.quantity || 0), 0);
    const cantidadNueva = Number(data.quantity || 0);
    const totalPropuesto = editingId
      ? totalActual - (offers.find(o => o.id === editingId)?.quantity || 0) + cantidadNueva
      : totalActual + cantidadNueva;

    if (hotel.max_rooms != null && totalPropuesto > hotel.max_rooms) {
      alert(`Te pasas del máximo del hotel (${hotel.max_rooms}).`);
      return;
    }

    // 3) Envío
    if (editingId) {
      router.put(`/hotel-room-offers/${editingId}`, data, {
        onSuccess: () => resetForm(),
        preserveScroll: true,
      });
    } else {
      router.post('/hotel-room-offers', data, {
        onSuccess: () => resetForm(),
        preserveScroll: true,
      });
    }
  }

  return (
    <AuthenticatedLayout
      header={<h2 className="text-xl font-semibold leading-tight text-gray-800">
        Configurar Acomodación Habitaciones — {hotel.name}
      </h2>}
    >
      <Head title={`Ofertas · ${hotel.name}`} />

      <div className="py-12">
        <div className="mx-auto max-w-screen-2xl sm:px-6 lg:px-8">
          {flash?.success && (
            <div className="mb-4 rounded border border-green-300 bg-green-50 px-4 py-2 text-green-800">
              {flash.success}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Tabla de ofertas */}
            <div className="lg:col-span-2">
              <div className="overflow-hidden rounded-lg bg-white shadow">
                <div className="border-b px-4 py-3">
                  <h3 className="text-lg font-semibold">Combinaciones creadas</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tipo</th>
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Acomodación</th>
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Cantidad</th>
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Precio base</th>
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {offers.length === 0 && (
                        <tr>
                          <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>
                            Aún no hay combinaciones registradas.
                          </td>
                        </tr>
                      )}
                      {offers.map((o) => (
                        <tr key={o.id}>
                          <td className="px-4 py-2">{o.room_type?.name ?? roomTypeById[o.room_type_id]?.name ?? '—'}</td>
                          <td className="px-4 py-2">{o.accommodation?.name ?? accommodationById[o.accommodation_id]?.name ?? '—'}</td>
                          <td className="px-4 py-2">{o.quantity ?? 0}</td>
                          <td className="px-4 py-2">
                            {o.base_price
                              ? Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(o.base_price)
                              : '—'}
                          </td>
                          <td className="px-4 py-2 flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => onEditClick(o)}
                              className="rounded bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => onDelete(o.id)}
                              className="rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between border-t px-4 py-2">
                  <a href="/dashboard" className="text-sm text-primary hover:underline">Regresar al panel de control</a>
                </div>
              </div>
            </div>

            {/* Formulario crear/editar */}
            <div>
              <div className="sticky top-6 rounded-lg border bg-white p-4 shadow" id="offer-form">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {editingId ? 'Editar combinación' : 'Crear combinación'}
                  </h3>
                </div>

                <form onSubmit={submit} className="space-y-3">
                  {/* Tipo de habitación */}
                  <div>
                    <label className="mb-1 block text-sm font-medium">Tipo de habitación *</label>
                    <select
                      className="w-full rounded border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      value={data.room_type_id}
                      onChange={(e) => setData('room_type_id', parseId(e.target.value))}
                      required
                    >
                      <option value="">Seleccione un tipo</option>
                      {roomTypes.map((rt) => (
                        <option key={rt.id} value={rt.id}>{rt.name}</option>
                      ))}
                    </select>
                    {errors.room_type_id && <p className="mt-1 text-sm text-red-600">{errors.room_type_id}</p>}
                  </div>

                  {/* Acomodación (filtrada por reglas) */}
                  <div>
                    <label className="mb-1 block text-sm font-medium">Acomodación *</label>
                    <select
                      className="w-full rounded border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      value={data.accommodation_id}
                      onChange={(e) => setData('accommodation_id', parseId(e.target.value))}
                      required
                      disabled={!data.room_type_id}
                    >
                      <option value="">{data.room_type_id ? 'Seleccione acomodación' : 'Primero elija un tipo'}</option>
                      {allowedAccommodations.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                    {data.room_type_id && (
                      <p className="mt-1 text-xs text-gray-500">
                        Permitidas: {(
                          RULES[norm(roomTypeById[data.room_type_id]?.name || '')] || []
                        )
                          .map(code => accommodations.find(a => norm(a.name) === code)?.name)
                          .filter(Boolean)
                          .join(', ') || '—'}
                      </p>
                    )}
                    {errors.accommodation_id && <p className="mt-1 text-sm text-red-600">{errors.accommodation_id}</p>}
                  </div>

                  {/* Cantidad */}
                  <div>
                    <label className="mb-1 block text-sm font-medium">Cantidad *</label>
                    <input
                      type="number"
                      min={0}
                      className="w-full rounded border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      value={data.quantity}
                      onChange={(e) => setData('quantity', e.target.value === '' ? '' : Number(e.target.value))}
                      required
                    />
                    {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
                  </div>

                  {/* Precio base */}
                  <div>
                    <label className="mb-1 block text-sm font-medium">Precio base</label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      className="w-full rounded border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      value={data.base_price}
                      onChange={(e) => setData('base_price', e.target.value === '' ? '' : Number(e.target.value))}
                    />
                    {errors.base_price && <p className="mt-1 text-sm text-red-600">{errors.base_price}</p>}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full rounded bg-primary px-4 py-2 text-white hover:bg-primary disabled:opacity-50"
                    >
                      {processing
                        ? (editingId ? 'Actualizando…' : 'Guardando…')
                        : (editingId ? 'Actualizar combinación' : 'Crear combinación')}
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
