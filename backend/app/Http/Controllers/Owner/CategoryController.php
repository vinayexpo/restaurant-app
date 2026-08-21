<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $categories = Category::where('restaurant_id', $request->get('restaurant')->id)
            ->orderBy('sort_order')
            ->get();

        return $this->success($categories);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'image' => 'nullable|string|max:500',
            'sort_order' => 'sometimes|integer|min:0',
            'is_active' => 'sometimes|boolean',
        ]);

        $category = Category::create([...$validated, 'restaurant_id' => $request->get('restaurant')->id]);

        return $this->success($category, 'Category created successfully.', 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $category = Category::where('restaurant_id', $request->get('restaurant')->id)->findOrFail($id);

        return $this->success($category);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $category = Category::where('restaurant_id', $request->get('restaurant')->id)->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'image' => 'nullable|string|max:500',
            'sort_order' => 'sometimes|integer|min:0',
            'is_active' => 'sometimes|boolean',
        ]);

        $category->update($validated);

        return $this->success($category->fresh(), 'Category updated successfully.');
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $category = Category::where('restaurant_id', $request->get('restaurant')->id)->findOrFail($id);
        $category->delete();

        return $this->success(null, 'Category deleted successfully.');
    }
}
