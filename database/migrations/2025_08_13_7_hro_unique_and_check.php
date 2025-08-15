<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('hotel_room_offers', function (Blueprint $t) {
            // Único por hotel + tipo + acomodación
            $t->unique(['hotel_id','room_type_id','accommodation_id'], 'hro_hotel_type_accommodation_unique');

            // Opcional: evita negativos (PostgreSQL soporta CHECK)
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE hotel_room_offers ADD CONSTRAINT hro_qty_nonneg CHECK (quantity >= 0)');
            DB::statement('ALTER TABLE hotel_room_offers ADD CONSTRAINT hro_price_nonneg CHECK (base_price >= 0)');
        }

        Schema::table('hotels', function (Blueprint $table) {
            // Único para NIT (nullable permite múltiples NULL en Postgres, está OK)
            $table->unique('nit', 'hotels_nit_unique');
        });

        // Si te basta con UNIQUE "normal" (sensible a mayúsculas/minúsculas):
        Schema::table('hotels', function (Blueprint $table) {
            $table->unique('name', 'hotels_name_unique');
        });

    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE hotel_room_offers DROP CONSTRAINT IF EXISTS hro_qty_nonneg');
            DB::statement('ALTER TABLE hotel_room_offers DROP CONSTRAINT IF EXISTS hro_price_nonneg');
        }

        Schema::table('hotel_room_offers', function (Blueprint $t) {
            $t->dropUnique('hro_hotel_type_accommodation_unique');
        });

        Schema::table('hotels', function (Blueprint $table) {
            $table->dropUnique('hotels_name_unique');
            $table->dropUnique('hotels_nit_unique');
        });
    }
};