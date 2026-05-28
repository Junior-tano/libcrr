<?php

use App\Http\Controllers\Api\EbookController;
use App\Http\Controllers\Api\HeroSlideController;
use App\Http\Controllers\Api\PhysicalBookController;
use App\Http\Controllers\Api\PodcastController;
use App\Http\Controllers\Api\UpcomingProgramController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\VideoController;
use Illuminate\Support\Facades\Route;

// Upload routes
Route::post('uploads/images', [UploadController::class, 'image']);
Route::post('uploads/audio', [UploadController::class, 'audio']);  // <-- NOUVEAU : upload audio podcast

// Resource routes
Route::apiResource('podcasts', PodcastController::class);
Route::apiResource('videos', VideoController::class);
Route::apiResource('ebooks', EbookController::class);
Route::apiResource('physical-books', PhysicalBookController::class);
Route::apiResource('programs', UpcomingProgramController::class);
Route::apiResource('hero-slides', HeroSlideController::class);