package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/jackc/pgx/v5"
)

func main() {
	// 1. Get the database connection string from Render/Environment
	dbUrl := os.Getenv("DATABASE_URL")
	if dbUrl == "" {
		log.Fatal("DATABASE_URL is not set")
	}

	// 2. Connect to the database
	conn, err := pgx.Connect(context.Background(), dbUrl)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	defer conn.Close(context.Background())

	// Define a simple API endpoint with CORS allowed
	http.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		// CRITICAL: This line tells browsers that ANY frontend is allowed to read this data
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		fmt.Fprintf(w, "NexBuy Backend is online and connected to Postgres!")
	})

	// 4. Start the server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	fmt.Println("Server starting on port " + port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
