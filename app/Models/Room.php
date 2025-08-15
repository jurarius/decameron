<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model {
    protected $fillable = ['hotel_room_offer_id','numeration','floor','status'];
    public function offer(){ return $this->belongsTo(HotelRoomOffer::class,'hotel_room_offer_id'); }
    public function hotel(){ return $this->offer->hotel(); } 
}
