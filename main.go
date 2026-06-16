package main

import (
	"context"
	"encoding/json" // Add this import for JSON handling
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/jackc/pgx/v5"
)

// Define a Product struct to match your database table columns
type Product struct {
	ID          int     `json:"id"`
	Name        string  `json:"name"`
	Description string  `json:"desc"`
	Price       float64 `json:"price"`
	Rating      float64 `json:"rating"`
	Reviews     int     `json:"reviews"`
	ImageURL    string  `json:"image"`
	Subcategory string  `json:"subcategory"`
}

func main() {
	dbUrl := os.Getenv("DATABASE_URL")
	if dbUrl == "" {
		log.Fatal("DATABASE_URL is not set")
	}

	// 1. Setup route for Health Check
	http.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		fmt.Fprintf(w, "NexBuy Backend is online and connected to Postgres!")
	})

	// 2. Setup route to Fetch Products from Database
	http.HandleFunc("/api/products", func(w http.ResponseWriter, r *http.Request) {
		// Enable CORS
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		// Connect to database per request or pass global pool (simplified here)
		conn, err := pgx.Connect(context.Background(), dbUrl)
		if err != nil {
			http.Error(w, "Database connection failed", http.StatusInternalServerError)
			return
		}
		defer conn.Close(context.Background())

		// Query the products table
		rows, err := conn.Query(context.Background(), "SELECT id, name, description, price, rating, reviews, image_url, subcategory FROM products")
		if err != nil {
			http.Error(w, "Failed to query products", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var products []Product
		for rows.Next() {
			var p Product
			err := rows.Scan(&p.ID, &p.Name, &p.Description, &p.Price, &p.Rating, &p.Reviews, &p.ImageURL, &p.Subcategory)
			if err != nil {
				continue
			}
			products = append(products, p)
		}

		// Convert products array to JSON and send it
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(products)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	fmt.Println("Server starting on port " + port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}