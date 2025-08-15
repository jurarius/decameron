<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('rooms', function (Blueprint $t) {
            $t->id();
            $t->foreignId('hotel_room_offer_id')->constrained('hotel_room_offers')->cascadeOnDelete();
            $t->string('numeration',30)->nullable();
            $t->integer('floor')->nullable();
            $t->string('status',30)->default('available');
            $t->timestampsTz();
            $t->unique(['hotel_room_offer_id','numeration'],'uq_room_offer_numeration');
        });
    }
    public function down(): void { Schema::dropIfExists('rooms'); }
};

