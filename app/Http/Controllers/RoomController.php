<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Hotel;
use App\Models\Room;
use App\Models\HotelRoomOffer;
use App\Http\Requests\StoreRoomRequest;

class RoomController extends Controller
{
    public function index(Hotel $hotel)
    {
        return Inertia::render('Rooms/Index', [
            'hotel'  => $hotel->load('city.country'),
            'offers' => $hotel->offers()->with(['roomType','accommodation'])->get(),
            'rooms'  => Room::whereHas('offer', fn($q)=>$q->where('hotel_id',$hotel->id))
                        ->with(['offer.roomType','offer.accommodation'])->paginate(20),
        ]);
    }

    public function store(StoreRoomRequest $r)
    {
        $offer = HotelRoomOffer::findOrFail($r->hotel_room_offer_id);
        if ($offer->rooms()->count() >= $offer->quantity) {
            return back()->withErrors(['hotel_room_offer_id' => 'Se alcanzó el máximo para esta oferta']);
        }

        Room::create($r->safe()->except('hotel_id'));
        return back()->with('success','Habitación creada');
    }

    public function update(StoreRoomRequest $r, Room $room)
    {
        $room->update($r->safe()->except('hotel_id'));
        return back()->with('success','Habitación actualizada');
    }

    public function destroy(Room $room)
    {
        $room->delete();
        return back()->with('success','Habitación eliminada');
    }
}
