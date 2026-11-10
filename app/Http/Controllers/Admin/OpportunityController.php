<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OpportunityType;
use App\Enums\ReviewStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\OpportunityRequest;
use App\Models\AuditLog;
use App\Models\Opportunity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/** Scholarships, internships and jobs the admin enters or edits by hand. */
class OpportunityController extends Controller
{
    public function store(OpportunityRequest $request, string $type): RedirectResponse
    {
        $opportunity = new Opportunity([...$request->opportunity(), 'type' => OpportunityType::from($type), 'accepts_applications' => false]);
        $opportunity->forceFill(['status' => ReviewStatus::Approved, 'reviewed_by' => $request->user()->id, 'reviewed_at' => now()])->save();
        AuditLog::record($request->user(), 'opportunity.created', "menambah {$opportunity->type->label()} {$opportunity->title}", $opportunity);

        return back()->with('success', "{$opportunity->title} ditambahkan.");
    }

    public function update(OpportunityRequest $request, Opportunity $opportunity): RedirectResponse
    {
        $this->adminManaged($opportunity);
        $opportunity->update($request->opportunity());
        AuditLog::record($request->user(), 'opportunity.updated', "mengubah {$opportunity->title}", $opportunity);

        return back()->with('success', "{$opportunity->title} diperbarui.");
    }

    public function destroy(Request $request, Opportunity $opportunity): RedirectResponse
    {
        $this->adminManaged($opportunity);
        $opportunity->delete();
        AuditLog::record($request->user(), 'opportunity.deleted', "menghapus {$opportunity->title}");

        return back()->with('success', "{$opportunity->title} dihapus.");
    }

    /** Partner programs are edited by their partner, not here. */
    private function adminManaged(Opportunity $opportunity): void
    {
        abort_if($opportunity->getAttribute('organization_id') !== null, 404);
    }
}
