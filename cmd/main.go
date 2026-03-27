package main

import (
	"log"
	"net/http"
	"os"

	"Exodus/internal/readq"
)

func main() {
	router := http.NewServeMux()
	name, err := os.Hostname()
	if err != nil {
		log.Fatal(err)
	}

	router.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./index.html")
	})

	fileServer := http.FileServer(http.Dir("./static"))
	router.Handle("GET /static/", http.StripPrefix("/static/", fileServer))

	router.HandleFunc("GET /readqueue", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./readqueue.html")
	})

	router.HandleFunc("GET /articles", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./articles.html")
	})

	router.HandleFunc("GET /api/articles", getArticles)
	router.HandleFunc("POST /api/articles", newArticle)
	router.HandleFunc("GET /api/readqueue", getQueue)
	router.HandleFunc("POST /api/readqueue", postRead)
	router.HandleFunc("PATCH /api/readqueue/status", readq.UpdateStatus)
	router.HandleFunc("PATCH /api/readqueue/finish", readq.FinishRead)

	log.Printf("Server has started without problems, serving at [%v] in port 8080", name)
	err = http.ListenAndServe(":8080", router)
	if err != nil {
		log.Fatal(err)
	}
}

func getMain(w http.ResponseWriter, req *http.Request) {
	http.ServeFile(w, req, "./index.html")
}

func getArticles(w http.ResponseWriter, req *http.Request) {
}

func newArticle(w http.ResponseWriter, req *http.Request) {}

func getQueue(w http.ResponseWriter, req *http.Request) {
	log.Printf("GET /api/readqueue from host: %v", req.Host)
	readq.ServeReads(w, req)
}

func postRead(w http.ResponseWriter, req *http.Request) {
	log.Printf("POST /api/readqueue from host: %v", req.Host)
	readq.NewRead(w, req)
}
