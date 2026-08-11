-- ============================================================
-- DB V2 Migration: Add CanteenID FK column to Tbl_User
-- ============================================================
-- This migration adds an optional canteen association to users.
-- - Canteen Admins (role = Manager) will have a non-null CanteenID.
-- - Students (role = User) who self-register will have CanteenID = NULL.
-- Run this script ONCE against the existing CFOSDB database.
-- Do NOT run db_v1.sql again; it drops and recreates all tables.
-- ============================================================

USE CFOSDB;

-- Step 1: Add the nullable CanteenID column to Tbl_User
ALTER TABLE Tbl_User
    ADD COLUMN CanteenID INT NULL AFTER RoleID;

-- Step 2: Add the foreign key constraint to Tbl_Canteen
ALTER TABLE Tbl_User
    ADD CONSTRAINT FK_User_Canteen
    FOREIGN KEY (CanteenID) REFERENCES Tbl_Canteen(BranchID)
    ON DELETE SET NULL
    ON UPDATE CASCADE;
