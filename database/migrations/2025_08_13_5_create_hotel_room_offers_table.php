<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('hotel_room_offers', function (Blueprint $t) {
            $t->id();
            $t->foreignId('hotel_id')->constrained('hotels')->cascadeOnDelete();
            $t->foreignId('room_type_id')->constrained('room_types')->restrictOnDelete();
            $t->foreignId('accommodation_id')->constrained('accommodations')->restrictOnDelete();
            $t->integer('quantity')->default(0);
            $t->decimal('base_price',12,2)->nullable();
            $t->timestampsTz();
            $t->unique(['hotel_id','room_type_id','accommodation_id'],'uq_offer_hotel_type_accom');
        });
    }
    public function down(): void { Schema::dropIfExists('hotel_room_offers'); }
};

