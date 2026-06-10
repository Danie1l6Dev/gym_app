<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('membership_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->unsignedSmallInteger('duration_days');
            $table->decimal('price', 10, 2)->default(0);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        DB::table('membership_types')->insert([
            [
                'name' => 'Semanal',
                'code' => 'weekly',
                'duration_days' => 7,
                'price' => 35000,
                'description' => 'Acceso al gimnasio durante 7 dias.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Mensual',
                'code' => 'monthly',
                'duration_days' => 30,
                'price' => 120000,
                'description' => 'Acceso al gimnasio durante 30 dias.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('membership_types');
    }
};
