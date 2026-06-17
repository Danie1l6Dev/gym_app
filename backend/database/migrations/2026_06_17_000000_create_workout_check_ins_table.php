<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workout_check_ins', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
            $table->date('workout_date');
            $table->timestamp('completed_at')->nullable();
            $table->string('notes')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'workout_date']);
            $table->index(['workout_date', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workout_check_ins');
    }
};
