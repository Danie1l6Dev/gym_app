<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE memberships MODIFY plan_type VARCHAR(60) NOT NULL');
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE memberships MODIFY plan_type ENUM('weekly', 'monthly') NOT NULL");
    }
};
