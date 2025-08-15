<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Accommodation extends Model {
    protected $fillable = ['name','capacity'];
    public function offers(){ return $this->hasMany(HotelRoomOffer::class); }
}
