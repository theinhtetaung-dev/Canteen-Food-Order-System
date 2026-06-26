package com.canteen.features.food;

import com.canteen.features.food.exception.FoodCategoryNotFoundException;
import com.canteen.features.food.exception.FoodNotFoundException;
import com.canteen.features.foodCategory.exception.UserNotFoundException;
import com.canteen.model.Food;
import com.canteen.model.FoodCategory;
import com.canteen.model.User;
import com.canteen.features.food.dto.FoodRequest;
import com.canteen.features.food.dto.FoodResponse;
import com.canteen.features.food.mapper.FoodMapper;
import com.canteen.repository.FoodRepository;
import com.canteen.repository.FoodCategoryRepository;
import com.canteen.repository.UserRepository;
import com.canteen.utils.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FoodService {

    private final FoodRepository foodRepository;
    private final FoodCategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final FoodMapper foodMapper;
    private final FileStorageService fileStorageService;

    public FoodResponse createFood(FoodRequest dto, MultipartFile image, String username) throws IOException {

        // 1. DTO → Entity (basic fields only)
        Food food = foodMapper.toEntity(dto);

        // 2. Load relationships
        FoodCategory category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() ->
                        new FoodCategoryNotFoundException(dto.getCategoryId()));

        User user = userRepository.findByUserName(username)
                .orElseThrow(() ->
                        new UserNotFoundException(username));

        food.setCategory(category);
        food.setCreatedBy(user);

        // 3. Handle image upload (local folder)
        if (image != null && !image.isEmpty()) {
            String imageUrl = fileStorageService.saveImage(image);
            food.setImageUrl(imageUrl);
        }

        // 4. Save to DB
        Food saved = foodRepository.save(food);

        // 5. Entity → DTO
        return foodMapper.toDTO(saved);
    }

    public List<FoodResponse> getAllFoods() {

        return foodRepository.findByDeleteFlagFalse()
                .stream()
                .map(foodMapper::toDTO)
                .toList();
    }

    public List<FoodResponse> getByCategory(Integer categoryId) {

        return foodRepository
                .findByCategory_CategoryIdAndDeleteFlagFalse(categoryId)
                .stream()
                .map(foodMapper::toDTO)
                .toList();
    }

    public List<FoodResponse> searchFood(String keyword) {

        return foodRepository
                .findByFoodNameContainingIgnoreCaseAndDeleteFlagFalse(keyword)
                .stream()
                .map(foodMapper::toDTO)
                .toList();
    }

    public FoodResponse getFoodById(Integer id) {

        Food food = foodRepository.findById(id)
                .orElseThrow(() -> new FoodNotFoundException(id));
        return foodMapper.toDTO(food);
    }

    public FoodResponse updateFood(Integer id, FoodRequest dto, MultipartFile image)
            throws IOException {

        Food food = foodRepository.findById(id)
                .orElseThrow(() -> new FoodNotFoundException(id));

        // update fields
        food.setFoodName(dto.getFoodName());
        food.setDescription(dto.getDescription());
        food.setPrice(dto.getPrice());
        food.setIsAvailable(dto.getIsAvailable());

        // update category if changed
        if (dto.getCategoryId() != null) {
            FoodCategory category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new FoodCategoryNotFoundException(dto.getCategoryId()));

            food.setCategory(category);
        }

        // update image if new one uploaded
        if (image != null && !image.isEmpty()) {
            String imageUrl = fileStorageService.saveImage(image);
            food.setImageUrl(imageUrl);
        }

        Food updated = foodRepository.save(food);

        return foodMapper.toDTO(updated);
    }

    public void deleteFood(Integer id) {

        Food food = foodRepository.findById(id)

                .orElseThrow(() -> new FoodNotFoundException(id));

        fileStorageService.deleteImage(food.getImageUrl());

        foodRepository.delete(food);

    }
}
