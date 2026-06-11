<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE muscles MODIFY name_es VARCHAR(255) NULL');
        } elseif ($driver === 'pgsql') {
            DB::statement('ALTER TABLE muscles ALTER COLUMN name_es DROP NOT NULL');
        } elseif ($driver === 'sqlite') {
            Schema::table('muscles', function ($table): void {
                $table->string('name_es')->nullable()->change();
            });
        }

        DB::table('muscles')
            ->whereColumn('name_es', 'name_en')
            ->update(['name_es' => null]);
    }

    public function down(): void
    {
        DB::table('muscles')
            ->whereNull('name_es')
            ->update(['name_es' => DB::raw('name_en')]);

        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE muscles MODIFY name_es VARCHAR(255) NOT NULL');
        } elseif ($driver === 'pgsql') {
            DB::statement('ALTER TABLE muscles ALTER COLUMN name_es SET NOT NULL');
        } elseif ($driver === 'sqlite') {
            Schema::table('muscles', function ($table): void {
                $table->string('name_es')->nullable(false)->change();
            });
        }
    }
};
