<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exercises', function (Blueprint $table): void {
            if (! Schema::hasColumn('exercises', 'name_original')) {
                $table->string('name_original')->nullable()->after('external_id');
            }

            if (! Schema::hasColumn('exercises', 'body_part')) {
                $table->string('body_part')->nullable()->after('name_original');
            }

            if (! Schema::hasColumn('exercises', 'target_muscle')) {
                $table->string('target_muscle')->nullable()->after('body_part');
            }

            if (! Schema::hasColumn('exercises', 'secondary_muscles')) {
                $table->json('secondary_muscles')->nullable()->after('target_muscle');
            }

            if (! Schema::hasColumn('exercises', 'equipment')) {
                $table->json('equipment')->nullable()->after('secondary_muscles');
            }

            if (! Schema::hasColumn('exercises', 'instructions_original')) {
                $table->json('instructions_original')->nullable()->after('gif_url');
            }

            if (! Schema::hasColumn('exercises', 'instructions_es')) {
                $table->json('instructions_es')->nullable()->after('instructions_original');
            }

            if (! Schema::hasColumn('exercises', 'raw_payload')) {
                $table->json('raw_payload')->nullable()->after('instructions_es');
            }

            $table->index(['body_part', 'target_muscle'], 'exercises_body_part_target_muscle_index');
            $table->index('name_original', 'exercises_name_original_index');
        });
    }

    public function down(): void
    {
        Schema::table('exercises', function (Blueprint $table): void {
            if (Schema::hasColumn('exercises', 'raw_payload')) {
                $table->dropIndex('exercises_body_part_target_muscle_index');
                $table->dropIndex('exercises_name_original_index');
                $table->dropColumn([
                    'name_original',
                    'body_part',
                    'target_muscle',
                    'secondary_muscles',
                    'equipment',
                    'instructions_original',
                    'instructions_es',
                    'raw_payload',
                ]);
            }
        });
    }
};
