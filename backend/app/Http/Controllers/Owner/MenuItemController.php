<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\MenuItem;
use App\Models\MenuItemVariant;
use App\Services\ImageService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MenuItemController extends Controller
{
    use ApiResponse;

    public function __construct(private ImageService $imageService) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'per_page' => 'nullable|integer|min:1|max:200',
            'search' => 'nullable|string|max:100',
            'category_id' => 'nullable|integer',
            'is_available' => 'nullable|boolean',
            'is_veg' => 'nullable|boolean',
        ]);
        $perPage = $filters['per_page'] ?? 20;

        $items = MenuItem::where('restaurant_id', $request->get('restaurant')->id)
            ->with(['category', 'variants'])
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where('name', 'like', "%{$search}%"))
            ->when($filters['category_id'] ?? null, fn ($query, $categoryId) => $query->where('category_id', $categoryId))
            ->when(isset($filters['is_available']), fn ($query) => $query->where('is_available', $filters['is_available']))
            ->when(isset($filters['is_veg']), fn ($query) => $query->where('is_veg', $filters['is_veg']))
            ->latest()->paginate($perPage);

        return $this->paginated($items);
    }

    public function store(Request $request): JsonResponse
    {
        $restaurant = $request->get('restaurant');

        $validated = $request->validate([
            'category_id' => 'required|integer',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'discounted_price' => 'nullable|numeric|min:0|lt:price',
            'is_veg' => 'sometimes|boolean',
            'is_available' => 'sometimes|boolean',
            'is_featured' => 'sometimes|boolean',
            'preparation_time' => 'sometimes|integer|min:1',
            'calories' => 'nullable|integer|min:0',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        Category::where('restaurant_id', $restaurant->id)->findOrFail($validated['category_id']);

        if ($request->hasFile('image')) {
            $validated['image'] = $this->imageService->storeWebP($request->file('image'), 'menu-items');
        }

        $item = MenuItem::create([...$validated, 'restaurant_id' => $restaurant->id]);

        return $this->success($item->load('category'), 'Menu item created successfully.', 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $item = MenuItem::where('restaurant_id', $request->get('restaurant')->id)
            ->with(['category', 'variants'])
            ->findOrFail($id);

        return $this->success($item);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $restaurant = $request->get('restaurant');
        $item = MenuItem::where('restaurant_id', $restaurant->id)->findOrFail($id);

        $validated = $request->validate([
            'category_id' => 'sometimes|integer',
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'discounted_price' => 'nullable|numeric|min:0|lt:price',
            'is_veg' => 'sometimes|boolean',
            'is_available' => 'sometimes|boolean',
            'is_featured' => 'sometimes|boolean',
            'preparation_time' => 'sometimes|integer|min:1',
            'calories' => 'nullable|integer|min:0',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        if (isset($validated['category_id'])) {
            Category::where('restaurant_id', $restaurant->id)->findOrFail($validated['category_id']);
        }

        if ($request->hasFile('image')) {
            $validated['image'] = $this->imageService->storeWebP($request->file('image'), 'menu-items');
        }

        $item->update($validated);

        return $this->success($item->fresh()->load('category', 'variants'), 'Menu item updated successfully.');
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $item = MenuItem::where('restaurant_id', $request->get('restaurant')->id)->findOrFail($id);
        $item->delete();

        return $this->success(null, 'Menu item deleted successfully.');
    }

    public function addVariant(Request $request, int $id): JsonResponse
    {
        $item = MenuItem::where('restaurant_id', $request->get('restaurant')->id)->findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'price' => 'required|numeric|min:0',
        ]);

        $variant = $item->variants()->create($validated);

        return $this->success($variant, 'Variant added successfully.', 201);
    }

    public function updateVariant(Request $request, int $id, int $variantId): JsonResponse
    {
        $item = MenuItem::where('restaurant_id', $request->get('restaurant')->id)->findOrFail($id);
        $variant = $item->variants()->findOrFail($variantId);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'price' => 'sometimes|numeric|min:0',
        ]);

        $variant->update($validated);

        return $this->success($variant->fresh(), 'Variant updated successfully.');
    }

    public function deleteVariant(Request $request, int $id, int $variantId): JsonResponse
    {
        $item = MenuItem::where('restaurant_id', $request->get('restaurant')->id)->findOrFail($id);
        $item->variants()->findOrFail($variantId)->delete();

        return $this->success(null, 'Variant deleted successfully.');
    }
}
