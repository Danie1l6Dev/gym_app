<?php

namespace App\Support;

class MuscleNameDictionary
{
    /**
     * @var array<string, string>
     */
    private const NAMES = [
        'abdominals' => 'abdominales',
        'abductors' => 'abductores',
        'abs' => 'abdominales',
        'adductors' => 'aductores',
        'ankle stabilizers' => 'estabilizadores de tobillo',
        'ankles' => 'tobillos',
        'back' => 'espalda',
        'biceps' => 'bíceps',
        'brachialis' => 'braquial',
        'calves' => 'pantorrillas',
        'cardiovascular system' => 'sistema cardiovascular',
        'chest' => 'pecho',
        'core' => 'zona media',
        'deltoids' => 'deltoides',
        'delts' => 'deltoides',
        'feet' => 'pies',
        'forearms' => 'antebrazos',
        'glutes' => 'glúteos',
        'grip muscles' => 'músculos de agarre',
        'groin' => 'ingle',
        'hamstrings' => 'isquiotibiales',
        'hands' => 'manos',
        'hip flexors' => 'flexores de cadera',
        'inner thighs' => 'muslos internos',
        'latissimus dorsi' => 'dorsal ancho',
        'lats' => 'dorsales',
        'levator scapulae' => 'elevador de la escápula',
        'lower abs' => 'abdomen inferior',
        'lower back' => 'espalda baja',
        'obliques' => 'oblicuos',
        'pectorals' => 'pectorales',
        'quadriceps' => 'cuádriceps',
        'quads' => 'cuádriceps',
        'rear deltoids' => 'deltoides posteriores',
        'rhomboids' => 'romboides',
        'rotator cuff' => 'manguito rotador',
        'serratus anterior' => 'serrato anterior',
        'shins' => 'espinillas',
        'shoulders' => 'hombros',
        'soleus' => 'sóleo',
        'spine' => 'columna',
        'sternocleidomastoid' => 'esternocleidomastoideo',
        'trapezius' => 'trapecio',
        'traps' => 'trapecio',
        'triceps' => 'tríceps',
        'upper back' => 'espalda alta',
        'upper chest' => 'pecho superior',
        'wrist extensors' => 'extensores de muñeca',
        'wrist flexors' => 'flexores de muñeca',
        'wrists' => 'muñecas',
    ];

    public static function translate(?string $name): ?string
    {
        $normalized = self::normalize($name);

        if ($normalized === '') {
            return null;
        }

        return self::NAMES[$normalized] ?? null;
    }

    private static function normalize(?string $name): string
    {
        return strtolower(trim((string) $name));
    }
}
