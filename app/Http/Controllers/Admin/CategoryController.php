<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryRequest;
use App\Models\AuditLog;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/categories/index', [
            'categories' => Category::query()
                ->select(['id', 'name', 'slug', 'description', 'created_at'])
                ->withCount('opportunities')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function store(CategoryRequest $request): RedirectResponse
    {
        $category = Category::query()->create($request->validated());
        AuditLog::record($request->user(), 'category.created', "menambah kategori {$category->name}", $category);

        return back()->with('success', "Kategori {$category->name} ditambahkan.");
    }

    public function update(CategoryRequest $request, Category $category): RedirectResponse
    {
        $category->update($request->validated());
        AuditLog::record($request->user(), 'category.updated', "mengubah kategori {$category->name}", $category);

        return back()->with('success', "Kategori {$category->name} diperbarui.");
    }

    public function destroy(Request $request, Category $category): RedirectResponse
    {
        // Opportunities keep existing; their category_id is set to null by the foreign key.
        $category->delete();
        AuditLog::record($request->user(), 'category.deleted', "menghapus kategori {$category->name}");

        return back()->with('success', "Kategori {$category->name} dihapus.");
    }
}
