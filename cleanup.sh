#!/bin/bash

echo "=========================================="
echo "CBL TSO Cleanup Script"
echo "=========================================="
echo ""

# Function to clean temporary files
clean_files() {
    echo ""
    echo "=========================================="
    echo "Cleaning temporary test/debug files..."
    echo "=========================================="
    echo ""
    
    local files_removed=0
    
    # Remove temporary test files
    if [ -f "check_power_battery_orders.js" ]; then
        echo "Removing check_power_battery_orders.js..."
        rm -f "check_power_battery_orders.js" && echo "  [OK] Removed" && ((files_removed++)) || echo "  [SKIP] Could not remove"
    fi
    
    # Remove temporary analysis reports
    if [ -f "FINAL_COLUMN_ANALYSIS_REPORT.md" ]; then
        echo "Removing FINAL_COLUMN_ANALYSIS_REPORT.md..."
        rm -f "FINAL_COLUMN_ANALYSIS_REPORT.md" && echo "  [OK] Removed" && ((files_removed++)) || echo "  [SKIP] Could not remove"
    fi
    
    # Remove backend temporary test files
    if [ -f "backend/check_power_battery_orders.js" ]; then
        echo "Removing backend/check_power_battery_orders.js..."
        rm -f "backend/check_power_battery_orders.js" && echo "  [OK] Removed" && ((files_removed++))
    fi
    
    if [ -f "backend/check_dealer_orders.js" ]; then
        echo "Removing backend/check_dealer_orders.js..."
        rm -f "backend/check_dealer_orders.js" && echo "  [OK] Removed" && ((files_removed++))
    fi
    
    if [ -f "backend/check_dealer_db.js" ]; then
        echo "Removing backend/check_dealer_db.js..."
        rm -f "backend/check_dealer_db.js" && echo "  [OK] Removed" && ((files_removed++))
    fi
    
    # Remove temporary SQL files
    if [ -f "check_power_battery_orders.sql" ]; then
        echo "Removing check_power_battery_orders.sql..."
        rm -f "check_power_battery_orders.sql" && echo "  [OK] Removed" && ((files_removed++))
    fi
    
    # Remove temporary analysis markdown files
    for file in *ANALYSIS*.md; do
        if [ -f "$file" ]; then
            echo "Removing $file..."
            rm -f "$file" && echo "  [OK] Removed" && ((files_removed++))
        fi
    done
    
    echo ""
    echo "=========================================="
    echo "Cleanup Summary: $files_removed file(s) removed"
    echo "=========================================="
}

# Function to clean Docker resources
clean_docker() {
    echo ""
    echo "=========================================="
    echo "Cleaning Docker resources..."
    echo "=========================================="
    echo ""
    echo "WARNING: This will remove Docker containers, images, and volumes."
    echo ""
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "Cleanup cancelled."
        return
    fi
    
    echo ""
    echo "Stopping containers..."
    docker-compose down 2>/dev/null
    
    echo ""
    echo "Removing unused containers..."
    docker container prune -f
    
    echo ""
    echo "Removing unused images..."
    docker image prune -f
    
    echo ""
    echo "Removing unused volumes..."
    docker volume prune -f
    
    echo ""
    echo "Cleaning build cache..."
    docker builder prune -f
    
    echo ""
    echo "=========================================="
    echo "Docker cleanup completed!"
    echo "=========================================="
}

# Main menu
echo "What would you like to clean?"
echo ""
echo "1. Temporary test/debug files"
echo "2. Docker resources (containers, images, volumes)"
echo "3. Both"
echo "4. Cancel"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        clean_files
        ;;
    2)
        clean_docker
        ;;
    3)
        clean_files
        clean_docker
        ;;
    4)
        echo "Cleanup cancelled."
        exit 0
        ;;
    *)
        echo ""
        echo "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

