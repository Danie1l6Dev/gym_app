<?php

namespace App\Console\Commands;

use App\Services\Memberships\MembershipAccountStatusService;
use Illuminate\Console\Command;

class SyncMembershipAccountStatusesCommand extends Command
{
    protected $signature = 'memberships:sync-account-statuses';

    protected $description = 'Vence membresias caducadas y activa/desactiva usuarios segun membresias pagadas vigentes';

    public function handle(MembershipAccountStatusService $service): int
    {
        $expiredMemberships = $service->expireOutdatedMemberships();
        $closedSupersededMemberships = $service->closeSupersededActiveMemberships();
        $syncedUsers = $service->syncAllUsers();

        $this->info("Membresias vencidas actualizadas: {$expiredMemberships}");
        $this->info("Membresias activas anteriores cerradas: {$closedSupersededMemberships}");
        $this->info("Usuarios sincronizados: {$syncedUsers}");

        return self::SUCCESS;
    }
}
