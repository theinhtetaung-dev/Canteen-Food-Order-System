package com.canteen.features.food;

import com.canteen.features.food.dto.FoodRequest;
import com.canteen.features.food.dto.FoodResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/foods")
@RequiredArgsConstructor
public class FoodController {

    private final FoodService foodService;

    @PostMapping
    public ResponseEntity<FoodResponse> createFood(
            @Valid @RequestPart("data") FoodRequest dto,
            @RequestPart(value = "image", required = false) MultipartFile image,
            HttpServletRequest httpRequest) throws IOException {

        String username = (String) httpRequest.getAttribute("username");
        return ResponseEntity.ok(foodService.createFood(dto, image, username));
    }

    @GetMapping
    public ResponseEntity<List<FoodResponse>> getAllFoods() {
        return ResponseEntity.ok(foodService.getAllFoods());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodResponse> getFoodById(@PathVariable Integer id) {
        return ResponseEntity.ok(foodService.getFoodById(id));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<FoodResponse>> getByCategory(
            @PathVariable Integer categoryId) {
        return ResponseEntity.ok(foodService.getByCategory(categoryId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<FoodResponse>> searchFood(
            @RequestParam String keyword) {
        return ResponseEntity.ok(foodService.searchFood(keyword));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FoodResponse> updateFood(
            @PathVariable Integer id,
            @Valid @RequestPart("data") FoodRequest dto,
            @RequestPart(value = "image", required = false) MultipartFile image) throws IOException {

        return ResponseEntity.ok(foodService.updateFood(id, dto, image));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteFood(@PathVariable Integer id) {

        foodService.deleteFood(id);
        return ResponseEntity.ok("Food deleted successfully (soft delete)");
    }
}
