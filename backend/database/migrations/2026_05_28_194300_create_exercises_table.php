<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exercises', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('muscle_id')->constrained()->cascadeOnUpdate()->restrictOnDelete();
            $table->string('source')->default('exercise_api');
            $table->string('external_id');
            $table->string('name_original')->nullable();
            $table->string('name_en');
            $table->string('name_es')->nullable();
            $table->string('body_part')->nullable();
            $table->string('target_muscle')->nullable();
            $table->json('secondary_muscles')->nullable();
            $table->json('equipment')->nullable();
            $table->text('description_en')->nullable();
            $table->text('description_es')->nullable();
            $table->string('gif_url')->nullable();
            $table->boolean('gif_available')->nullable();
            $table->timestamp('gif_checked_at')->nullable();
            $table->json('instructions_original')->nullable();
            $table->json('instructions_es')->nullable();
            $table->json('raw_payload')->nullable();
            $table->json('source_payload')->nullable();
            $table->timestamp('synced_at')->nullable();
            $table->timestamps();

            $table->unique('external_id');
            $table->index(['muscle_id', 'name_en']);
            $table->index(['body_part', 'target_muscle']);
            $table->index('name_original');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exercises');
    }
};
