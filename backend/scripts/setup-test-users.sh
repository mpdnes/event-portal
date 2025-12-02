#!/bin/bash

# Setup Test Users via API
# This script creates test users by calling the registration API
# Run this AFTER starting the backend server

API_URL="http://localhost:5000/api"

echo "================================================"
echo "Creating Test Users for PD Portal"
echo "================================================"
echo ""

# Function to create a user
create_user() {
    local email=$1
    local password=$2
    local first_name=$3
    local last_name=$4

    echo "Creating user: $email"

    response=$(curl -s -X POST "$API_URL/auth/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$email\",
            \"password\": \"$password\",
            \"first_name\": \"$first_name\",
            \"last_name\": \"$last_name\"
        }")

    if echo "$response" | grep -q "token"; then
        echo "✅ User created: $email"
    elif echo "$response" | grep -q "already exists"; then
        echo "ℹ️  User already exists: $email"
    else
        echo "❌ Error creating $email: $response"
    fi
    echo ""
}

# Check if backend is running
echo "Checking if backend is running..."
if curl -s "$API_URL/health" > /dev/null; then
    echo "✅ Backend is running"
    echo ""
else
    echo "❌ Backend is not running!"
    echo "Start the backend with: cd backend && npm run dev"
    exit 1
fi

# Create test users
create_user "staff1@test.com" "password123" "John" "Doe"
create_user "staff2@test.com" "password123" "Jane" "Smith"
create_user "staff3@test.com" "password123" "Bob" "Johnson"
create_user "manager@test.com" "password123" "Manager" "User"
create_user "admin@test.com" "password123" "Admin" "User"

echo "================================================"
echo "Test users created!"
echo "================================================"
echo ""
echo "Now you need to manually upgrade roles in the database:"
echo ""
echo "  psql -U postgres -d pd_portal"
echo ""
echo "  UPDATE users SET role = 'admin' WHERE email = 'admin@test.com';"
echo "  UPDATE users SET role = 'manager' WHERE email = 'manager@test.com';"
echo ""
echo "  \\q"
echo ""
echo "After that, load the rest of the test data:"
echo "  psql -U postgres -d pd_portal -f backend/database/test-data.sql"
echo ""
