<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('room_types', function (Blueprint $t) {
            $t->id();
            $t->string('name',120);
            $t->text('description')->nullable();
            $t->timestampsTz();
        });
    }
    public function down(): void { Schema::dropIfExists('room_types'); }
};

