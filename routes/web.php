<?php

use App\Http\Controllers\AccountSettingsController;
use App\Http\Controllers\Admin;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\ApplicationTaskController;
use App\Http\Controllers\ApplicationWorkspaceController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LearningController;
use App\Http\Controllers\LegalController;
use App\Http\Controllers\MentoringController;
use App\Http\Controllers\OpportunityCatalogController;
use App\Http\Controllers\OpportunityDetailController;
use App\Http\Controllers\OrganizationPortalController;
use App\Http\Controllers\PrivateDocumentController;
use App\Http\Controllers\TalentPassportController;
use App\Http\Controllers\TourController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::get('/kebijakan-privasi', [LegalController::class, 'privacy'])->name('legal.privacy');
Route::get('/syarat-penggunaan', [LegalController::class, 'terms'])->name('legal.terms');
Route::get('/peluang/detail/{opportunity}', [OpportunityDetailController::class, 'show'])->name('catalog.show');
Route::get('/peluang/{type}', [OpportunityCatalogController::class, 'index'])->name('catalog.index');

Route::middleware('guest')->group(function () {
    Route::inertia('/masuk', 'auth', ['tab' => 'login'])->name('login');
    Route::post('/masuk', [AuthenticatedSessionController::class, 'store'])->name('login.store');

    Route::inertia('/daftar', 'auth', ['tab' => 'register'])->name('register');
    Route::post('/daftar', [RegisteredUserController::class, 'store'])->middleware('throttle:5,1')->name('register.store');

    Route::get('/lupa-kata-sandi', [PasswordResetLinkController::class, 'create'])->name('password.request');
    Route::post('/lupa-kata-sandi', [PasswordResetLinkController::class, 'store'])->middleware('throttle:5,1')->name('password.email');
    Route::get('/atur-ulang-kata-sandi/{token}', [NewPasswordController::class, 'create'])->name('password.reset');
    Route::post('/atur-ulang-kata-sandi', [NewPasswordController::class, 'store'])->middleware('throttle:5,1')->name('password.store');
});

Route::middleware(['auth', 'active'])->group(function () {
    Route::get('/pengaturan-akun', [AccountSettingsController::class, 'edit'])->name('account.edit');
    Route::put('/pengaturan-akun', [AccountSettingsController::class, 'update'])->name('account.update');
    Route::put('/pengaturan-akun/kata-sandi', [AccountSettingsController::class, 'password'])->name('account.password');
    Route::get('/dashboard', DashboardController::class)->name('dashboard');
    Route::post('/panduan/{tour}/selesai', [TourController::class, 'complete'])->name('tours.complete');
    Route::middleware('role:peserta')->group(function () {
        Route::post('/peluang/{opportunity}/laporan', [OpportunityDetailController::class, 'report'])->middleware('throttle:5,1')->name('catalog.report');
        Route::post('/peluang/{opportunity}/daftar', [OpportunityDetailController::class, 'apply'])->name('catalog.apply');
        Route::get('/belajar', [LearningController::class, 'index'])->name('learning.index');
        Route::post('/belajar/{opportunity}', [LearningController::class, 'enroll'])->name('learning.enroll');
        Route::get('/belajar/{opportunity}', [LearningController::class, 'show'])->name('learning.show');
        Route::patch('/belajar/{opportunity}/materi/{lesson}', [LearningController::class, 'progress'])->name('learning.progress');
        Route::get('/bimbingan', [MentoringController::class, 'index'])->name('mentoring.index');
        Route::post('/bimbingan', [MentoringController::class, 'store'])->name('mentoring.store');
        Route::patch('/bimbingan/{session}/umpan-balik', [MentoringController::class, 'feedback'])->name('mentoring.feedback');
        Route::post('/profil-mentor', [MentoringController::class, 'profile'])->name('mentoring.profile');
        Route::get('/aplikasi/{application}/ruang-kerja', [ApplicationWorkspaceController::class, 'show'])->name('workspace.show');
        Route::post('/aplikasi/{application}/draft', [ApplicationWorkspaceController::class, 'draft'])->name('workspace.draft');
        Route::post('/dokumen', [PrivateDocumentController::class, 'store'])->name('documents.store');
        Route::get('/dokumen/{document}', [PrivateDocumentController::class, 'download'])->name('documents.download');
        Route::delete('/dokumen/{document}', [PrivateDocumentController::class, 'destroy'])->name('documents.destroy');
        Route::get('/aplikasi', [ApplicationController::class, 'index'])->name('applications.index');
        Route::post('/aplikasi/{opportunity}', [ApplicationController::class, 'store'])->name('applications.store');
        Route::patch('/aplikasi/{application}', [ApplicationController::class, 'update'])->name('applications.update');
        Route::delete('/aplikasi/{application}', [ApplicationController::class, 'destroy'])->name('applications.destroy');
        Route::post('/aplikasi/{application}/tugas', [ApplicationTaskController::class, 'store'])->name('application-tasks.store');
        Route::patch('/aplikasi/{application}/tugas/{task}', [ApplicationTaskController::class, 'update'])->name('application-tasks.update');
        Route::delete('/aplikasi/{application}/tugas/{task}', [ApplicationTaskController::class, 'destroy'])->name('application-tasks.destroy');
        Route::get('/talent-passport', [TalentPassportController::class, 'edit'])->name('passport.edit');
        Route::put('/talent-passport', [TalentPassportController::class, 'update'])->name('passport.update');
    });

    Route::post('/organisasi/{organization}/kelas/{opportunity}/materi', [LearningController::class, 'lesson'])->name('organizations.lesson');
    Route::post('/organisasi', [OrganizationPortalController::class, 'store'])->name('organizations.store');
    Route::put('/organisasi/{organization}', [OrganizationPortalController::class, 'update'])->name('organizations.update');
    Route::put('/organisasi/{organization}/program/{opportunity}', [OrganizationPortalController::class, 'program'])->name('organizations.program-update');
    Route::patch('/organisasi/{organization}/program/{opportunity}/tutup', [OrganizationPortalController::class, 'close'])->name('organizations.program-close');
    Route::post('/organisasi/{organization}/program', [OrganizationPortalController::class, 'program'])->name('organizations.program');
    Route::post('/organisasi/{organization}/anggota', [OrganizationPortalController::class, 'member'])->name('organizations.member');
    Route::delete('/organisasi/{organization}/anggota/{member}', [OrganizationPortalController::class, 'removeMember'])->name('organizations.remove-member');
    Route::patch('/organisasi/{organization}/pendaftar/{application}', [OrganizationPortalController::class, 'candidate'])->name('organizations.candidate');
    Route::post('/keluar', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    // Role dashboards.
    Route::get('/mentor', [MentoringController::class, 'dashboard'])->middleware('role:mentor')->name('mentor.dashboard');
    Route::patch('/mentor/sesi/{session}', [MentoringController::class, 'update'])->middleware('role:mentor')->name('mentoring.update');
    Route::delete('/mentor/jadwal/{slot}', [MentoringController::class, 'removeAvailability'])->middleware('role:mentor')->name('mentoring.remove-availability');
    Route::post('/mentor/jadwal', [MentoringController::class, 'availability'])->middleware('role:mentor')->name('mentoring.availability');
    Route::put('/mentor/profil', [MentoringController::class, 'profile'])->middleware('role:mentor')->name('mentoring.profile.update');
    Route::get('/mitra', [OrganizationPortalController::class, 'partner'])->middleware('role:mitra')->name('partner.dashboard');
    Route::get('/perusahaan', [OrganizationPortalController::class, 'company'])->middleware('role:perusahaan')->name('company.dashboard');
});

Route::middleware(['auth', 'active', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', Admin\DashboardController::class)->name('dashboard');

    Route::get('pengguna', [Admin\UserController::class, 'index'])->name('users.index');
    Route::post('pengguna', [Admin\UserController::class, 'store'])->name('users.store');
    Route::patch('pengguna/{user}', [Admin\UserController::class, 'update'])->name('users.update');
    Route::delete('pengguna/{user}', [Admin\UserController::class, 'destroy'])->name('users.destroy');

    Route::get('verifikasi', [Admin\VerificationController::class, 'index'])->name('verifications.index');
    Route::patch('verifikasi/mitra/{organization}', [Admin\VerificationController::class, 'updateOrganization'])->name('verifications.organizations.update');
    Route::patch('verifikasi/mentor/{mentorProfile}', [Admin\VerificationController::class, 'updateMentor'])->name('verifications.mentors.update');

    Route::get('moderasi', [Admin\ModerationController::class, 'index'])->name('moderation.index');
    Route::patch('moderasi/{opportunity}', [Admin\ModerationController::class, 'update'])->name('moderation.update');

    Route::get('laporan', [Admin\ReportController::class, 'index'])->name('reports.index');
    Route::patch('laporan/{report}', [Admin\ReportController::class, 'update'])->name('reports.update');

    Route::resource('kategori', Admin\CategoryController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->parameters(['kategori' => 'category'])
        ->names('categories');

    Route::get('audit-log', [Admin\AuditLogController::class, 'index'])->name('audit-logs.index');
    Route::get('analitik', Admin\AnalyticsController::class)->name('analytics');

    Route::get('pengaturan', [Admin\SettingController::class, 'edit'])->name('settings.edit');
    Route::put('pengaturan', [Admin\SettingController::class, 'update'])->name('settings.update');
});
