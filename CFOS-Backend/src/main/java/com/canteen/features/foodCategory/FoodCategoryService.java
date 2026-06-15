package com.canteen.features.foodCategory;

import com.canteen.features.foodCategory.dto.FoodCategoryRequest;
import com.canteen.features.foodCategory.dto.FoodCategoryResponse;
import com.canteen.features.foodCategory.mapper.FoodCategoryMapper;
import com.canteen.model.FoodCategory;
import com.canteen.model.User;
import com.canteen.repository.FoodCategoryRepository;
import com.canteen.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FoodCategoryService {

    private final FoodCategoryRepository foodCategoryRepository;
    private final UserRepository userRepository;
    private final FoodCategoryMapper foodCategoryMapper;

    // CREATE
    public FoodCategoryResponse create(FoodCategoryRequest request) {

        //  check duplicate
        boolean exists = foodCategoryRepository
                .existsByCategoryNameIgnoreCaseAndDeleteFlagFalse(request.getCategoryName());

        if (exists) {
            throw new RuntimeException("Category already exists");
        }

        //  find user
        User user = userRepository.findById(request.getCreatedBy())
                .orElseThrow(() -> new RuntimeException("User not found"));

        //  map DTO -> Entity
        FoodCategory category = foodCategoryMapper.toEntity(request, user);

        //  save
        category = foodCategoryRepository.save(category);

        // 5. map Entity -> Response DTO
        return foodCategoryMapper.toDTO(category);
    }

    // UPDATE
    public FoodCategoryResponse update(Integer id, FoodCategoryRequest request) {

        FoodCategory category = foodCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // update fields only
        foodCategoryMapper.updateEntity(request, category);

        category = foodCategoryRepository.save(category);

        return foodCategoryMapper.toDTO(category);
    }

    // GET ALL
    public List<FoodCategoryResponse> getAll() {

        return foodCategoryRepository.findByDeleteFlagFalse()
                .stream()
                .map(foodCategoryMapper::toDTO)
                .toList();
    }

    // GET BY ID
    public FoodCategoryResponse getById(Integer id) {

        FoodCategory category = foodCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        return foodCategoryMapper.toDTO(category);
    }

    // DELETE (SOFT DELETE)
    public void delete(Integer id) {

        FoodCategory category = foodCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        category.setDeleteFlag(true);

        foodCategoryRepository.save(category);
    }
}
