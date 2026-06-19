package com.canteen.utils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class FileStorageService {

    // Folder outside src (project root)
    private final String uploadDir =
            System.getProperty("user.dir") + "/uploads/food-images/";


    public String saveImage(MultipartFile file) throws IOException {

        // 1. Check file
        if (file == null || file.isEmpty()) {
            return null;
        }

        // 2. Create unique file name
        String fileName = System.currentTimeMillis()
                + "_"
                + file.getOriginalFilename();

        // 3. Create folder if not exists
        Path directory = Paths.get(uploadDir);

        if (!Files.exists(directory)) {
            Files.createDirectories(directory);
        }

        // 4. Save file
        Path filePath = directory.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        // 5. Return URL (stored in DB)
        return "/food-images/" + fileName;
    }
}
