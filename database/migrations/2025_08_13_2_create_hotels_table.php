<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('hotels', function (Blueprint $t) {
            $t->id();
            $t->foreignId('city_id')->constrained('cities')->restrictOnDelete();
            $t->string('name',150);
            $t->string('nit',50)->nullable();
            $t->integer('max_rooms')->nullable();
            $t->string('address',200)->nullable();
            $t->string('phone',50)->nullable();
            $t->string('email',150)->nullable();
            $t->timestampsTz();
        });
    }
    public function down(): void { Schema::dropIfExists('hotels'); }
};

