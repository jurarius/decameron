<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('cities', function (Blueprint $t) {
            $t->id();
            $t->foreignId('country_id')->constrained('countries')->restrictOnDelete();
            $t->string('name',120);
            $t->timestampsTz();
        });
    }
    public function down(): void { Schema::dropIfExists('cities'); }
};
