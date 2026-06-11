<?php

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'success' => true,
        'message' => 'Gym API is running.',
    ]);
});

Route::get('/test-translate', function () {
    $baseUrl = rtrim((string) config('services.libretranslate.url'), '/');

    $response = Http::baseUrl($baseUrl)->post('/translate', [
        'q' => 'Lie flat on your back.',
        'source' => 'en',
        'target' => 'es',
        'format' => 'text'
    ]);

    return $response->json();
});
