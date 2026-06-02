<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'exercise_api' => [
        'url' => env('EXERCISE_API_URL'),
        'key' => env('EXERCISE_API_KEY'),
        'timeout' => env('EXERCISE_API_TIMEOUT', 30),
        'source' => env('EXERCISE_API_SOURCE', 'exercise_api'),
    ],

    'exercise_db' => [
        'base_url' => env('EXERCISE_DB_BASE_URL') ?: env('EXERCISE_API_URL') ?: 'https://oss.exercisedb.dev',
        'muscles_path' => env('EXERCISE_DB_MUSCLES_PATH') ?: '/api/v1/muscles',
        'bodyparts_path' => env('EXERCISE_DB_BODYPARTS_PATH') ?: '/api/v1/bodyparts',
        'exercises_path' => env('EXERCISE_DB_EXERCISES_PATH') ?: '/api/v1/exercises',
        'key' => env('EXERCISE_DB_KEY') ?: env('EXERCISE_API_KEY'),
        'timeout' => env('EXERCISE_DB_TIMEOUT') ?: env('EXERCISE_API_TIMEOUT') ?: 30,
        'source' => env('EXERCISE_DB_SOURCE') ?: 'exercise_db_v1',
        'verify_ssl' => env('EXERCISE_DB_VERIFY_SSL', false),
    ],

];
