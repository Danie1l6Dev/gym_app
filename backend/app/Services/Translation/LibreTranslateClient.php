<?php

namespace App\Services\Translation;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class LibreTranslateClient
{
    public function translate(string $text, string $source = 'en', string $target = 'es'): string
    {
        $translations = $this->translateMany([$text], $source, $target);

        return $translations[0] ?? '';
    }

    /**
     * @param  array<int, string>  $texts
     * @return array<int, string>
     */
    public function translateMany(array $texts, string $source = 'en', string $target = 'es'): array
    {
        $texts = array_values(array_filter(
            array_map(fn (mixed $text) => is_string($text) ? trim($text) : '', $texts),
            fn (string $text) => $text !== ''
        ));

        if ($texts === []) {
            return [];
        }

        $baseUrl = trim((string) config('services.libretranslate.url'));

        if ($baseUrl === '') {
            throw new RuntimeException('No se configuro la URL de LibreTranslate.');
        }

        $response = Http::baseUrl(rtrim($baseUrl, '/'))
            ->acceptJson()
            ->asJson()
            ->timeout((int) config('services.libretranslate.timeout', 30))
            ->retry(3, 1000)
            ->post('/translate', [
                'q' => $texts,
                'source' => $source,
                'target' => $target,
                'format' => 'text',
            ])
            ->throw();

        $translated = $response->json('translatedText');

        if (is_string($translated)) {
            $translated = [trim($translated)];
        }

        if (! is_array($translated)) {
            throw new RuntimeException('LibreTranslate devolvio una traduccion invalida.');
        }

        $translated = array_values(array_map(
            fn (mixed $text) => is_string($text) ? trim($text) : '',
            $translated
        ));

        if (count($translated) !== count($texts) || in_array('', $translated, true)) {
            throw new RuntimeException('LibreTranslate devolvio una traduccion vacia o incompleta.');
        }

        return $translated;
    }
}
