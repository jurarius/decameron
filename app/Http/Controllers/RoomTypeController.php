<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class RoomTypeController extends Controller
{
    public function index()
    {
        return Inertia::render('RoomTypes/Index', [
            'items' => RoomType::orderBy('nombre')->paginate(20),
        ]);
    }
    public function store(StoreRoomTypeRequest $r){ RoomType::create($r->validated()); return back()->with('success','Tipo creado'); }
    public function update(StoreRoomTypeRequest $r, RoomType $roomType){ $roomType->update($r->validated()); return back()->with('success','Tipo actualizado'); }
    public function destroy(RoomType $roomType){ $roomType->delete(); return back()->with('success','Tipo eliminado'); }
}
