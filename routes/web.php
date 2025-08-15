<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\HotelController;
use App\Http\Controllers\RoomTypeController;
use App\Http\Controllers\AccommodationController;
use App\Http\Controllers\HotelRoomOfferController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\ProfileController;
use App\Models\Hotel;
use App\Models\City;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard', [
        'hotels' => Hotel::with('city')->orderByDesc('id')->paginate(10),
        'cities' => City::orderBy('name')->get(['id', 'name']),
    ]);
})->middleware(['auth','verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    // Perfil (Breeze)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Hoteles (index ya lo usas como dashboard)
    Route::resource('hotels', HotelController::class)
        ->only(['index','store','show','update','destroy'])
        ->names('hotels');

    // Tipos de habitación
    Route::resource('room-types', RoomTypeController::class)
        ->only(['index','store','update','destroy'])
        ->names('room-types');

    // Acomodaciones
    Route::resource('accommodations', AccommodationController::class)
        ->only(['index','store','update','destroy'])
        ->names('accommodations');

    // Ofertas (hotel + tipo + acomodación)
    Route::resource('hotel-room-offers', HotelRoomOfferController::class)
        ->only(['index','store','update','destroy'])
        ->names('offers');

    // Helper para el front: listar ofertas por hotel (para selects dependientes)
    Route::get('hotels/{hotel}/offers', [HotelRoomOfferController::class, 'byHotel'])
        ->name('hotels.offers');

    // Habitaciones físicas (por hotel vía offer)
    Route::get('hotels/{hotel}/rooms', [RoomController::class, 'index'])->name('hotels.rooms.index');
    Route::post('rooms', [RoomController::class, 'store'])->name('rooms.store');
    Route::put('rooms/{room}', [RoomController::class, 'update'])->name('rooms.update');
    Route::delete('rooms/{room}', [RoomController::class, 'destroy'])->name('rooms.destroy');

    Route::get('hotels/{hotel}/offers', [HotelRoomOfferController::class, 'manage'])
    ->middleware(['auth','verified'])
    ->name('hotels.offers.manage');
});

require __DIR__.'/auth.php';
