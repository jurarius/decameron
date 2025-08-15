<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoomType extends Model {
    protected $fillable = ['name','description'];
    public function offers(){ return $this->hasMany(HotelRoomOffer::class); }
}
