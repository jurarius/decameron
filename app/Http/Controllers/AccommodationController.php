<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AccommodationController extends Controller
{
    public function index(){ return Accommodation::orderBy('capacity')->orderBy('name')->get(); }
    public function store(StoreAccommodationRequest $r){ return Accommodation::create($r->validated()); }
    public function update(StoreAccommodationRequest $r, Accommodation $accommodation){ $accommodation->update($r->validated()); return $accommodation; }
    public function destroy(Accommodation $accommodation){ $accommodation->delete(); return response()->noContent(); }
}
