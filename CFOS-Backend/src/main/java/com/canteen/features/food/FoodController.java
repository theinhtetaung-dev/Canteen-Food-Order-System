package com.canteen.features.food;


import com.canteen.features.food.dto.FoodRequest;
import com.canteen.features.food.dto.FoodResponse;
import com.canteen.features.food.FoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/foods")
@RequiredArgsConstructor
public class FoodController {

    private final FoodService foodService;

    //creating food with images
    @PostMapping
    public ResponseEntity<FoodResponse> createFood(
            @RequestPart("data") FoodRequest dto,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) throws IOException {

        return ResponseEntity.ok(foodService.createFood(dto, image));
    }

    //getting all food
    @GetMapping
    public ResponseEntity<List<FoodResponse>> getAllFoods() {
        return ResponseEntity.ok(foodService.getAllFoods());
    }

    //getting food by id
    @GetMapping("/{id}")
    public ResponseEntity<FoodResponse> getFoodById(@PathVariable Integer id) {
        return ResponseEntity.ok(foodService.getFoodById(id));
    }

    //getting by category
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<FoodResponse>> getByCategory(
            @PathVariable Integer categoryId
    ) {
        return ResponseEntity.ok(foodService.getByCategory(categoryId));
    }

    //searching food
    @GetMapping("/search")
    public ResponseEntity<List<FoodResponse>> searchFood(
            @RequestParam String keyword
    ) {
        return ResponseEntity.ok(foodService.searchFood(keyword));
    }

    //updating
    @PutMapping("/{id}")
    public ResponseEntity<FoodResponse> updateFood(
            @PathVariable Integer id,
            @RequestPart("data") FoodRequest dto,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) throws IOException {

        return ResponseEntity.ok(foodService.updateFood(id, dto, image));
    }

    //deleting
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteFood(@PathVariable Integer id) {

        foodService.deleteFood(id);
        return ResponseEntity.ok("Food deleted successfully (soft delete)");
    }
}