<?php

namespace App\Enums;

enum Gender: string
{
    case Male = 'male';
    case Female = 'female';
    case Other = 'other';

    public static function values(): array
    {
        return array_map(static fn (self $gender) => $gender->value, self::cases());
    }
}
