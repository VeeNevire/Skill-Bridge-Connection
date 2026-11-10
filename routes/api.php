<?php

use App\Http\Controllers\Api\ScholarshipController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware('throttle:60,1,scholarship-api:')->group(function () {
    Route::get('beasiswa', [ScholarshipController::class, 'index']);
    Route::post('beasiswa/tanya', [ScholarshipController::class, 'ask'])->middleware('throttle:5,1,scholarship-ai:');
    Route::get('beasiswa/{id}', [ScholarshipController::class, 'show'])->whereNumber('id');
});
