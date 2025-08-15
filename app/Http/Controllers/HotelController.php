<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Hotel;
use App\Models\City;
use App\Http\Requests\StoreHotelRequest;

class HotelController extends Controller
{
    public function index()
    {
        return Inertia::render('Hotels/Index', [
            'hotels' => Hotel::with('city.country')->orderByDesc('id')->paginate(10),
            'cities' => City::with('country:id,name')->orderBy('name')
                            ->get(['id','name','country_id']),
        ]);
    }

    public function store(StoreHotelRequest $request)
    {
        Hotel::create($request->validated());
        return back()->with('success','Hotel creado');
    }

    public function show(Hotel $hotel)
    {
        return Inertia::render('Hotels/Show', [
            'hotel' => $hotel->load('city.country','offers.roomType','offers.accommodation'),
        ]);
    }

    public function update(StoreHotelRequest $request, Hotel $hotel)
    {
        $hotel->update($request->validated());
        return back()->with('success','Hotel actualizado');
    }

    public function destroy(Hotel $hotel)
    {
        $hotel->delete();
        return back()->with('success','Hotel eliminado');
    }
}
