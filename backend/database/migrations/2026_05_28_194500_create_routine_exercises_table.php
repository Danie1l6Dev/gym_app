<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('routine_exercises', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('routine_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('exercise_id')->constrained()->cascadeOnUpdate()->restrictOnDelete();
            $table->unsignedInteger('position');
            $table->unsignedTinyInteger('sets')->nullable();
            $table->unsignedTinyInteger('reps')->nullable();
            $table->unsignedSmallInteger('rest_seconds')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['routine_id', 'exercise_id']);
            $table->unique(['routine_id', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('routine_exercises');
    }
};
