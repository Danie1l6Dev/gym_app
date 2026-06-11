<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exercises', function (Blueprint $table): void {
            if (! Schema::hasColumn('exercises', 'gif_available')) {
                $table->boolean('gif_available')->nullable()->after('gif_url');
            }

            if (! Schema::hasColumn('exercises', 'gif_checked_at')) {
                $table->timestamp('gif_checked_at')->nullable()->after('gif_available');
            }
        });
    }

    public function down(): void
    {
        Schema::table('exercises', function (Blueprint $table): void {
            if (Schema::hasColumn('exercises', 'gif_checked_at')) {
                $table->dropColumn('gif_checked_at');
            }

            if (Schema::hasColumn('exercises', 'gif_available')) {
                $table->dropColumn('gif_available');
            }
        });
    }
};
