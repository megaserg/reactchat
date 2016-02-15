package main

import (
	"log"
	"net/http"
	"time"

	r "github.com/dancannon/gorethink"
)

type Channel struct {
	Id   string `json:"id" gorethink:"id,omitempty"`
	Name string `json:"name" gorethink:"name"`
}

type User struct {
	Id   string `json:"id" gorethink:"id,omitempty"`
	Name string `json:"name" gorethink:"name"`
}

type Message struct {
	Id        string    `json:"id" gorethink:"id,omitempty"`
	Body      string    `json:"body" gorethink:"body"`
	Author    string    `json:"author" gorethink:"author"`
	CreatedAt time.Time `json:"created_at" gorethink:"createdAt"`
	ChannelId string    `json:"channel_id" gorethink:"channelId"`
}

func main() {
	session, err := r.Connect(r.ConnectOpts{
		Address:  "localhost:28015",
		Database: "reactchat",
	})
	if err != nil {
		log.Panic(err.Error())
	}

	router := NewRouter(session)

	router.Handle("channel add", addChannel)
	router.Handle("channel subscribe", subscribeChannel)
	router.Handle("channel unsubscribe", unsubscribeChannel)

	router.Handle("user edit", editUsername)
	router.Handle("user subscribe", subscribeUser)
	router.Handle("user unsubscribe", unsubscribeUser)

	router.Handle("message add", addMessage)
	router.Handle("message subscribe", subscribeMessage)
	router.Handle("message unsubscribe", unsubscribeMessage)

	http.Handle("/", router)
	http.ListenAndServe(":4000", nil)
}
