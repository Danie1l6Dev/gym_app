<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('routine_days', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('routine_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('day_id')->constrained()->cascadeOnUpdate()->restrictOnDelete();
            $table->timestamps();

            $table->unique(['routine_id', 'day_id']);
            $table->index(['day_id', 'routine_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('routine_days');
    }
};
