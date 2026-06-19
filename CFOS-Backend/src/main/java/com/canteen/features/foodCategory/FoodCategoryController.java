package com.canteen.features.foodCategory;


import com.canteen.features.foodCategory.dto.FoodCategoryRequest;
import com.canteen.features.foodCategory.dto.FoodCategoryResponse;
import com.canteen.features.foodCategory.FoodCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/food-categories")
@RequiredArgsConstructor
public class FoodCategoryController {

    private final FoodCategoryService foodCategoryService;

    // CREATE
    @PostMapping
    public ResponseEntity<FoodCategoryResponse> create(
            @Valid @RequestBody FoodCategoryRequest request) {

        return ResponseEntity.ok(foodCategoryService.create(request));
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<FoodCategoryResponse> update(
            @PathVariable Integer id,
            @Valid @RequestBody FoodCategoryRequest request) {

        return ResponseEntity.ok(foodCategoryService.update(id, request));
    }

    // GET ALL
    @GetMapping
    public ResponseEntity<List<FoodCategoryResponse>> getAll() {

        return ResponseEntity.ok(foodCategoryService.getAll());
    }

    // GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<FoodCategoryResponse> getById(
            @PathVariable Integer id) {

        return ResponseEntity.ok(foodCategoryService.getById(id));
    }

    // DELETE (SOFT DELETE)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {

        foodCategoryService.delete(id);

        return ResponseEntity.ok("Food Category deleted successfully");
    }
}
