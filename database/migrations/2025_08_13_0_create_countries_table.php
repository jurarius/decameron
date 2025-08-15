<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('countries', function (Blueprint $t) {
            $t->id();
            $t->string('name',120);
            $t->timestampsTz();
        });
    }
    public function down(): void { Schema::dropIfExists('countries'); }
};
