-- ============================================================
-- DB V3 Migration: Add Comment column to Tbl_OrderItem
-- ============================================================
-- This migration adds a nullable Comment column to the order item details.
-- Run this script ONCE against the existing CFOSDB database.
-- ============================================================

USE CFOSDB;

ALTER TABLE Tbl_OrderItem
    ADD COLUMN Comment VARCHAR(255) NULL AFTER SubTotal;
