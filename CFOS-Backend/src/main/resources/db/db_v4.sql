-- ============================================================
-- DB V4 Migration: Create Tbl_Review
-- ============================================================
-- This migration creates the Tbl_Review table.
-- Run this script ONCE against the existing CFOSDB database.
-- ============================================================

USE CFOSDB;

CREATE TABLE IF NOT EXISTS Tbl_Review (
    ReviewID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT NOT NULL,
    Rating DOUBLE NOT NULL,
    ReviewText TEXT NOT NULL,
    DeleteFlag BOOLEAN DEFAULT FALSE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Tbl_User(UserID)
);
