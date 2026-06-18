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

        if ($user->manually_deactivated_at !== null) {
            if ($user->is_active) {
                $user->forceFill(['is_active' => false])->save();
                $user->tokens()->delete();
            }

            return $user->refresh();
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

    public function reactivateFromPaidMembership(Membership $membership): User
    {
        $user = $membership->user()->with('role')->firstOrFail();

        if ($user->role?->slug === 'admin') {
            return $user;
        }

        if ($this->membershipIsCurrentAndPaid($membership)) {
            $user->forceFill([
                'is_active' => true,
                'manually_deactivated_at' => null,
            ])->save();
        }

        return $this->syncUser($user->refresh());
    }

    public function expireOutdatedMemberships(): int
    {
        $today = Carbon::today()->toDateString();

        return Membership::query()
            ->where('status', 'active')
            ->whereDate('ends_at', '<', $today)
            ->update(['status' => 'expired']);
    }

    public function closeSupersededActiveMemberships(): int
    {
        $closed = 0;

        Membership::query()
            ->select('user_id')
            ->where('status', 'active')
            ->groupBy('user_id')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('user_id')
            ->each(function ($userId) use (&$closed): void {
                $activeMemberships = Membership::query()
                    ->where('user_id', $userId)
                    ->where('status', 'active')
                    ->orderByDesc('ends_at')
                    ->orderByDesc('id')
                    ->get();

                $keep = $activeMemberships->first();

                if (! $keep) {
                    return;
                }

                $closed += Membership::query()
                    ->whereIn('id', $activeMemberships
                        ->pluck('id')
                        ->filter(fn ($id) => (int) $id !== (int) $keep->id)
                        ->values())
                    ->update(['status' => 'expired']);
            });

        return $closed;
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

    private function membershipIsCurrentAndPaid(Membership $membership): bool
    {
        $today = Carbon::today();

        return $membership->status === 'active'
            && $membership->paid_at !== null
            && Carbon::parse($membership->starts_at)->lte($today)
            && Carbon::parse($membership->ends_at)->gte($today);
    }
}
