<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    public function image(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $file = $request->file('image');
        $filename = Str::uuid().'.'.$file->getClientOriginalExtension();
        $directory = public_path('uploads');

        if (! is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        $file->move($directory, $filename);

        return response()->json([
            'url' => url('/uploads/'.$filename),
        ], 201);
    }
}
