<?php

namespace App\Services\Memberships;

use App\Models\Membership;
use App\Models\User;
use Illuminate\Support\Carbon;

class MembershipAccountStatusService
{
    public function syncUser(User $user): User
    {
        $user->loadMissing('role');

        if ($user->role?->slug === 'admin') {
            return $user;
        }

        $shouldBeActive = $this->hasCurrentPaidMembership($user);

        if ($user->is_active !== $shouldBeActive) {
            $user->forceFill(['is_active' => $shouldBeActive])->save();

            if (! $shouldBeActive) {
                $user->tokens()->delete();
            }
        }

        return $user->refresh();
    }

    public function syncFromMembership(Membership $membership): User
    {
        return $this->syncUser($membership->user()->with('role')->firstOrFail());
    }

    public function expireOutdatedMemberships(): int
    {
        $today = Carbon::today()->toDateString();

        return Membership::query()
            ->where('status', 'active')
            ->whereDate('ends_at', '<', $today)
            ->update(['status' => 'expired']);
    }

    public function syncAllUsers(): int
    {
        $synced = 0;

        User::query()
            ->with('role')
            ->whereHas('role', fn ($query) => $query->where('slug', '!=', 'admin'))
            ->chunkById(100, function ($users) use (&$synced): void {
                foreach ($users as $user) {
                    $this->syncUser($user);
                    $synced++;
                }
            });

        return $synced;
    }

    private function hasCurrentPaidMembership(User $user): bool
    {
        $today = Carbon::today()->toDateString();

        return $user->memberships()
            ->where('status', 'active')
            ->whereNotNull('paid_at')
            ->whereDate('starts_at', '<=', $today)
            ->whereDate('ends_at', '>=', $today)
            ->exists();
    }
}
