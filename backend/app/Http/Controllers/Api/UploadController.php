<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /**
     * Upload d'une image (couverture de podcast, livre, etc.)
     */
    public function image(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $file      = $request->file('image');
        $filename  = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $directory = public_path('uploads/images');

        if (! is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        $file->move($directory, $filename);

        return response()->json([
            'url' => url('/uploads/images/' . $filename),
        ], 201);
    }

    /**
     * Upload d'un fichier audio (podcast MP3, WAV, M4A, OGG)
     * Endpoint : POST /api/uploads/audio
     */
    public function audio(Request $request): JsonResponse
    {
        // Augmenter les limites PHP à l'exécution pour les gros fichiers
        ini_set('upload_max_filesize', '5120M');
        ini_set('post_max_size', '5120M');
        ini_set('max_execution_time', '300');
        ini_set('max_input_time', '300');
        ini_set('memory_limit', '512M');

        $request->validate([
            'audio' => 'required|file|mimes:mp3,wav,m4a,ogg,mpeg,mpga|max:512000', // 500 MB max
        ]);

        $file      = $request->file('audio');
        $filename  = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $directory = public_path('uploads/audio');

        if (! is_dir($directory)) {
            mkdir($directory, 0777, true);
        }

        $file->move($directory, $filename);

        return response()->json([
            'url' => url('/uploads/audio/' . $filename),
        ], 201);
    }
}