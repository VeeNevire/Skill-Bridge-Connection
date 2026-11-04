<?php

namespace App\Http\Requests\Admin;

use App\Enums\ReviewStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Approve or reject a moderated item; a reason is required when rejecting.
 */
class ReviewRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'decision' => ['required', Rule::in([ReviewStatus::Approved->value, ReviewStatus::Rejected->value])],
            'note' => ['nullable', 'string', 'max:255', Rule::requiredIf($this->input('decision') === ReviewStatus::Rejected->value)],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'note.required' => 'Alasan penolakan wajib diisi.',
        ];
    }

    public function decision(): ReviewStatus
    {
        return ReviewStatus::from($this->validated('decision'));
    }
}
