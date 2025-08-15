<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Hotel;
use App\Models\RoomType;
use App\Models\Accommodation;
use App\Models\HotelRoomOffer;
use App\Http\Requests\StoreHotelRoomOfferRequest;
use App\Http\Requests\UpdateHotelRoomOfferRequest;
use Illuminate\Support\Facades\DB;

class HotelRoomOfferController extends Controller
{
    /**
     * Endpoint JSON auxiliar para selects dependientes
     */
    public function byHotel(Hotel $hotel)
    {
        return $hotel->offers()->with(['roomType','accommodation'])->get();
    }

    /**
     * (Opcional) Listado general de ofertas (no por hotel).
     * Si no lo usas, puedes quitarlo del resource.
     */
    public function index()
    {
        return Inertia::render('Offers/Index', [
            'offers' => HotelRoomOffer::with(['hotel:id,name','roomType:id,name','accommodation:id,name'])
                ->orderByDesc('id')
                ->paginate(20),
        ]);
    }

    /**
     * Página principal para configurar combinaciones por hotel
     */
    public function manage(Hotel $hotel)
    {
        return Inertia::render('Hotels/Offers', [
            'hotel'          => $hotel->only(['id','name','max_rooms']),
            'roomTypes'      => RoomType::orderBy('name')->get(['id','name']),
            'accommodations' => Accommodation::orderBy('name')->get(['id','name']),
            'offers'         => $hotel->offers()
                ->with(['roomType:id,name','accommodation:id,name'])
                ->orderByDesc('id')
                ->get(),
        ]);
    }

    /**
     * Crear combinación (hotel + tipo + acomodación) con validaciones
     */
    public function store(StoreHotelRoomOfferRequest $r)
    {
        DB::transaction(function () use ($r) {
            // Lock al hotel para evitar condiciones de carrera en la suma
            $hotel = Hotel::whereKey($r->hotel_id)->lockForUpdate()->first();

            // Revalidación de suma dentro de la transacción
            $current = HotelRoomOffer::where('hotel_id', $r->hotel_id)->sum('quantity');
            if (!is_null($hotel->max_rooms) && ($current + (int)$r->quantity) > $hotel->max_rooms) {
                abort(422, "La suma de cantidades excede el máximo del hotel ({$hotel->max_rooms}).");
            }

            HotelRoomOffer::create($r->validated());
        });

        return back()->with('success','Combinación creada');
    }

    /**
     * Actualizar combinación con las mismas garantías
     */
    public function update(UpdateHotelRoomOfferRequest $r, HotelRoomOffer $hotelRoomOffer)
    {
        DB::transaction(function () use ($r, $hotelRoomOffer) {
            $hotel = Hotel::whereKey($r->hotel_id)->lockForUpdate()->first();

            $sumOther = HotelRoomOffer::where('hotel_id', $r->hotel_id)
                ->where('id', '!=', $hotelRoomOffer->id)
                ->sum('quantity');

            if (!is_null($hotel->max_rooms) && ($sumOther + (int)$r->quantity) > $hotel->max_rooms) {
                abort(422, "La suma de cantidades excede el máximo del hotel ({$hotel->max_rooms}).");
            }

            $hotelRoomOffer->update($r->validated());
        });

        return back()->with('success','Combinación actualizada');
    }

    /**
     * Eliminar combinación
     */
    public function destroy(HotelRoomOffer $hotelRoomOffer)
    {
        $hotelRoomOffer->delete();
        return back()->with('success','Combinación eliminada');
    }
};