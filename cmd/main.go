package main

import (
	"crypto/subtle"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"sync"
)

type BlogPost struct {
	ID          int    `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Thumbnail   string `json:"thumbnail"`
	URL         string `json:"url"`
	Platform    string `json:"platform"` // e.g., "YouTube", "Medium"
}

var (
	posts     []BlogPost
	postsLock sync.Mutex
	postsFile = "posts.json"
	adminPassword string
)

func init() {
	adminPassword = os.Getenv("ADMIN_PASSWORD")
	if adminPassword == "" {
		adminPassword = "changeme"
		log.Println("WARNING: ADMIN_PASSWORD not set, using default 'changeme'")
	}
	loadPosts()
}

func loadPosts() {
	data, err := os.ReadFile(postsFile)
	if err != nil {
		if os.IsNotExist(err) {
			posts = []BlogPost{}
			return
		}
		log.Printf("Error reading posts file: %v", err)
		return
	}
	err = json.Unmarshal(data, &posts)
	if err != nil {
		log.Printf("Error unmarshaling posts: %v", err)
	}
}

func savePosts() {
	data, err := json.MarshalIndent(posts, "", "  ")
	if err != nil {
		log.Printf("Error marshaling posts: %v", err)
		return
	}
	err = os.WriteFile(postsFile, data, 0644)
	if err != nil {
		log.Printf("Error writing posts file: %v", err)
	}
}

func timingSafeCompare(a, b string) bool {
	return subtle.ConstantTimeCompare([]byte(a), []byte(b)) == 1
}

func main() {
	router := http.NewServeMux()
	name, err := os.Hostname()
	if err != nil {
		log.Fatal(err)
	}

	router.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./index.html")
	})

	router.HandleFunc("GET /blog", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./blog.html")
	})

	router.HandleFunc("GET /api/blog", func(w http.ResponseWriter, r *http.Request) {
		postsLock.Lock()
		defer postsLock.Unlock()
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(posts)
	})

	router.HandleFunc("POST /api/blog", func(w http.ResponseWriter, r *http.Request) {
		password := r.Header.Get("X-Admin-Password")
		if !timingSafeCompare(password, adminPassword) {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
		var newPost BlogPost
		if err := json.NewDecoder(r.Body).Decode(&newPost); err != nil {
			http.Error(w, "Bad request", http.StatusBadRequest)
			return
		}
		if newPost.Title == "" || newPost.URL == "" || newPost.Platform == "" {
			http.Error(w, "title, url and platform are required", http.StatusBadRequest)
			return
		}

		postsLock.Lock()
		defer postsLock.Unlock()
		newPost.ID = len(posts) + 1
		posts = append(posts, newPost)
		savePosts()

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(newPost)
	})

	router.HandleFunc("POST /api/auth", func(w http.ResponseWriter, r *http.Request) {
		r.Body = http.MaxBytesReader(w, r.Body, 1<<10)
		var credentials struct {
			Password string `json:"password"`
		}
		if err := json.NewDecoder(r.Body).Decode(&credentials); err != nil {
			http.Error(w, "Bad request", http.StatusBadRequest)
			return
		}

		if timingSafeCompare(credentials.Password, adminPassword) {
			w.WriteHeader(http.StatusOK)
		} else {
			http.Error(w, "Invalid password", http.StatusUnauthorized)
		}
	})

	fileServer := http.FileServer(http.Dir("./static"))
	router.Handle("GET /static/", http.StripPrefix("/static/", fileServer))

	log.Printf("Server has started without problems, serving at [%v] in port 8080", name)
	err = http.ListenAndServe(":8080", router)
	if err != nil {
		log.Fatal(err)
	}
}
