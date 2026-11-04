<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateTalentPassportRequest;
use App\Models\PrivateDocument;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TalentPassportController extends Controller
{
    public function edit(Request $request): Response
    {
        $id = $request->user()->id;
        $profile = DB::table('talent_profiles')->where('user_id', $id)->first(['phone', 'bio', 'portfolio_url', 'interests', 'preferred_location', 'preferred_level', 'preferred_opportunity']);

        return Inertia::render('dashboard', [
            'initialTab' => 'passport',
            'documents' => PrivateDocument::query()->where('user_id', $id)->whereNull('application_id')->latest('id')->paginate(10, ['id', 'title', 'kind', 'original_name'])->withQueryString(),
            'passport' => [
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'interests' => $profile->interests ?? '',
                'preferred_location' => $profile->preferred_location ?? '',
                'preferred_level' => $profile->preferred_level ?? '',
                'preferred_opportunity' => $profile->preferred_opportunity ?? '',
                'phone' => $profile->phone ?? '',
                'bio' => $profile->bio ?? '',
                'portfolio_url' => $profile->portfolio_url ?? '',
                'educations' => DB::table('educations')->where('user_id', $id)->orderBy('id')->get(['institution', 'degree', 'field', 'start_year', 'end_year']),
                'skills' => DB::table('talent_skills')->where('user_id', $id)->orderBy('id')->get(['name', 'level']),
                'experiences' => DB::table('experiences')->where('user_id', $id)->orderBy('id')->get(['title', 'organization', 'description']),
            ],
        ]);
    }

    public function update(UpdateTalentPassportRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $user = $request->user();
        DB::transaction(function () use ($data, $user) {
            $user->update(['name' => $data['name']]);
            DB::table('talent_profiles')->updateOrInsert(['user_id' => $user->id], [
                'interests' => $data['interests'] ?? null, 'preferred_location' => $data['preferred_location'] ?? null, 'preferred_level' => $data['preferred_level'] ?? null, 'preferred_opportunity' => $data['preferred_opportunity'] ?? null,
                'phone' => $data['phone'] ?? null, 'bio' => $data['bio'] ?? null,
                'portfolio_url' => $data['portfolio_url'] ?? null, 'updated_at' => now(),
            ]);
            foreach (['educations' => 'educations', 'skills' => 'talent_skills', 'experiences' => 'experiences'] as $key => $table) {
                DB::table($table)->where('user_id', $user->id)->delete();
                foreach ($data[$key] as $item) {
                    DB::table($table)->insert([...$item, 'user_id' => $user->id, 'created_at' => now(), 'updated_at' => now()]);
                }
            }
        });

        return to_route('passport.edit')->with('success', 'Talent Passport berhasil disimpan.');
    }
}
