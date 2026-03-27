package readq

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/google/uuid"
)

type Read struct {
	ID           uuid.UUID  `json:"id"`
	URL          string     `json:"url"`
	Title        string     `json:"title"`
	IsRead       bool       `json:"isRead"`
	IsReading    bool       `json:"isReading"`
	DateAdded    time.Time  `json:"dateAdded"`
	DateFinished *time.Time `json:"dateFinished"`
	Score        *int       `json:"score"`
}

var ReadQ = []*Read{}

func ServeReads(w http.ResponseWriter, req *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ReadQ)
}

func NewRead(w http.ResponseWriter, req *http.Request) {
	var read Read
	err := json.NewDecoder(req.Body).Decode(&read)
	if err != nil {
		log.Printf("Error decoding JSON object in NewRead() to add a new post to the queue: %v", err)
		http.Error(w, "Error adding a post to the reading queue due to a malformed JSON object", http.StatusBadRequest)
	}
	defer req.Body.Close()
	read.ID = uuid.New()
	read.DateAdded = time.Now()
	ReadQ = append(ReadQ, &read)
}

func UpdateStatus(w http.ResponseWriter, r *http.Request) {
	var body struct {
		ID uuid.UUID `json:"id"`
	}
	json.NewDecoder(r.Body).Decode(&body)

	for _, item := range ReadQ {
		if item.ID == body.ID {
			item.IsReading = !item.IsReading
			break
		}
	}
	w.WriteHeader(http.StatusOK)
}

func FinishRead(w http.ResponseWriter, r *http.Request) {
	var body struct {
		ID    uuid.UUID `json:"id"`
		Score int       `json:"score"`
	}
	json.NewDecoder(r.Body).Decode(&body)

	now := time.Now()
	for _, item := range ReadQ {
		if item.ID == body.ID {
			item.IsRead = true
			item.IsReading = false
			item.Score = &body.Score
			item.DateFinished = &now
			break
		}
	}
	w.WriteHeader(http.StatusOK)
}
