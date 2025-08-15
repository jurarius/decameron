<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Hotel extends Model {
    protected $fillable = ['city_id','name','nit','max_rooms','address','phone','email'];
    public function city(){ return $this->belongsTo(City::class); }
    public function offers(){ return $this->hasMany(HotelRoomOffer::class); }
}
