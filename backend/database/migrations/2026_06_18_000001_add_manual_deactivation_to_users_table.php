<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->timestamp('manually_deactivated_at')->nullable()->after('is_active');
            $table->index('manually_deactivated_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropIndex(['manually_deactivated_at']);
            $table->dropColumn('manually_deactivated_at');
        });
    }
};
