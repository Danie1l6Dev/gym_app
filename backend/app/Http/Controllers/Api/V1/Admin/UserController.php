<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\IndexUserRequest;
use App\Http\Requests\Api\V1\Admin\StoreUserRequest;
use App\Http\Requests\Api\V1\Admin\UpdateUserRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\Membership;
use App\Models\MembershipType;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(IndexUserRequest $request): JsonResponse
    {
        $filters = $request->validated();

        $users = User::query()
            ->with(['role', 'latestMembership'])
            ->when(isset($filters['role']), function ($query) use ($filters): void {
                $query->whereHas('role', function ($roleQuery) use ($filters): void {
                    $roleQuery->where('slug', $filters['role']);
                });
            }, function ($query): void {
                $query->whereHas('role', function ($roleQuery): void {
                    $roleQuery->where('slug', '!=', 'admin');
                });
            })
            ->when(isset($filters['search']), function ($query) use ($filters): void {
                $search = $filters['search'];

                $query->where(function ($inner) use ($search): void {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($filters['per_page'] ?? 15);

        return UserResource::collection($users)
            ->additional(['message' => 'Usuarios obtenidos correctamente.'])
            ->response();
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = DB::transaction(function () use ($data): User {
            $roleId = $this->resolveRoleId($data);

            $user = User::create([
                'role_id' => $roleId,
                'name' => $data['name'],
                'username' => $data['username'] ?? null,
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'phone' => $data['phone'] ?? null,
                'birth_date' => $data['birth_date'] ?? null,
                'gender' => $data['gender'] ?? 'other',
                'height' => $data['height'] ?? null,
                'weight' => $data['weight'] ?? null,
                'profile_photo' => $data['profile_photo'] ?? null,
                'is_active' => $data['is_active'] ?? true,
            ]);

            $roleSlug = Role::query()->whereKey($roleId)->value('slug');

            if ($roleSlug === 'user') {
                $planType = $data['membership_plan_type'] ?? 'monthly';
                $startsAt = Carbon::today();
                $membershipType = MembershipType::query()
                    ->where('code', $planType)
                    ->first();
                $endsAt = $startsAt->copy()->addDays($membershipType?->duration_days ?? 0);

                Membership::create([
                    'user_id' => $user->id,
                    'plan_type' => $planType,
                    'starts_at' => $startsAt->toDateString(),
                    'ends_at' => $endsAt->toDateString(),
                    'status' => 'active',
                    'price' => (float) ($membershipType?->price ?? 0),
                    'paid_at' => now(),
                    'notes' => $data['membership_notes'] ?? null,
                ]);
            }

            return $user;
        });

        return UserResource::make($user->load(['role', 'latestMembership.type']))
            ->additional(['message' => 'Usuario creado correctamente.'])
            ->response()
            ->setStatusCode(201);
    }

    public function show(User $user): JsonResponse
    {
        $viewer = request()->user();

        $relations = ['role', 'latestMembership.type', 'memberships.type'];

        if ($viewer?->id === $user->id) {
            $relations[] = 'routines.exercises.muscle';
        } else {
            $relations['routines'] = fn ($query) => $query->where('is_predefined', true)->with('exercises.muscle');
        }

        return UserResource::make($user->load($relations))
            ->additional(['message' => 'Usuario obtenido correctamente.'])
            ->response();
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $data = $request->validated();

        $updates = [];

        if (array_key_exists('role_slug', $data)) {
            $updates['role_id'] = $this->resolveRoleId($data);
        }

        foreach ([
            'role_id',
            'name',
            'username',
            'email',
            'phone',
            'birth_date',
            'gender',
            'height',
            'weight',
            'profile_photo',
            'is_active',
        ] as $field) {
            if (array_key_exists($field, $data)) {
                $updates[$field] = $data[$field];
            }
        }

        if (array_key_exists('password', $data) && $data['password'] !== null) {
            $updates['password'] = Hash::make($data['password']);
        }

        $user->fill($updates);

        $user->save();

        return UserResource::make($user->load(['role', 'latestMembership']))
            ->additional(['message' => 'Usuario actualizado correctamente.'])
            ->response();
    }

    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return response()->json([
            'data' => null,
            'message' => 'Usuario eliminado correctamente.',
        ]);
    }

    private function resolveRoleId(array $data): int
    {
        if (isset($data['role_id'])) {
            return (int) $data['role_id'];
        }

        return (int) Role::query()
            ->where('slug', $data['role_slug'])
            ->value('id');
    }
}
