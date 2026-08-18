package com.canteen.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Tbl_Food")
@Data
@NoArgsConstructor

public class Food {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "FoodID")
    private Integer foodId;

    @ManyToOne
    @JoinColumn(name = "CategoryID", nullable = false)
    private FoodCategory category;

    @Column(name = "FoodName", nullable = false)
    private String foodName;

    @Column(name = "Description")
    private String description;

    @Column(name = "Price", nullable = false)
    private BigDecimal price;

    @Column(name = "ImageURL")
    private String imageUrl;

    @Column(name = "IsAvailable")
    private Boolean isAvailable = true;

    @ManyToOne
    @JoinColumn(name = "CreatedBy", nullable = false)
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BranchID")
    private Branch branch;

    @Column(name = "DeleteFlag")
    private Boolean deleteFlag = false;

    @Column(name = "CreatedAt", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "UpdatedAt")
    private LocalDateTime updatedAt;
}