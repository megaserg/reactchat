package main

import (
	"fmt"
	"time"

	r "github.com/dancannon/gorethink"
	"github.com/mitchellh/mapstructure"
)

const (
	ChannelStop = iota
	UserStop
	MessageStop
)

func addChannel(client *Client, data interface{}) {
	var channel Channel
	err := mapstructure.Decode(data, &channel)
	if err != nil {
		client.send <- SocketMessage{"error", err.Error()}
		return
	}

	insert := r.Table("channel").Insert(channel)
	asyncDatabaseQuery(client, insert)
}

func editUsername(client *Client, data interface{}) {
	var user User
	err := mapstructure.Decode(data, &user)
	if err != nil {
		client.send <- SocketMessage{"error", err.Error()}
		return
	}
	client.userName = user.Name

	update := r.Table("user").Get(client.userId).Update(user)
	asyncDatabaseQuery(client, update)
}

func addMessage(client *Client, data interface{}) {
	var message Message
	err := mapstructure.Decode(data, &message)
	if err != nil {
		client.send <- SocketMessage{"error", err.Error()}
		return
	}
	message.CreatedAt = time.Now()
	message.Author = client.userName
	insert := r.Table("message").Insert(message)
	asyncDatabaseQuery(client, insert)
}

func asyncDatabaseQuery(client *Client, operation r.Term) {
	go func() {
		err := operation.Exec(client.session)
		if err != nil {
			client.send <- SocketMessage{"error", err.Error()}
		}
	}()
}

func subscribeChannel(client *Client, data interface{}) {
	cursor, err := r.Table("channel").
		Changes(r.ChangesOpts{IncludeInitial: true}).
		Run(client.session)
	if err != nil {
		client.send <- SocketMessage{"error", err.Error()}
		return
	}
	createSubscription(cursor, client, "channel", ChannelStop)
}

func subscribeUser(client *Client, data interface{}) {
	var user User
	user.Name = "anonymous"
	client.userName = "anonymous"
	resp, err := r.Table("user").Insert(user).RunWrite(client.session)
	if err != nil {
		client.send <- SocketMessage{"error", err.Error()}
		return
	}
	if len(resp.GeneratedKeys) > 0 {
		client.userId = resp.GeneratedKeys[0]
		fmt.Println("created user id " + client.userId)
	}

	cursor, err := r.Table("user").
		OrderBy(r.OrderByOpts{Index: r.Asc("name")}).
		Changes(r.ChangesOpts{IncludeInitial: true}).
		Run(client.session)
	if err != nil {
		client.send <- SocketMessage{"error", err.Error()}
		return
	}
	createSubscription(cursor, client, "user", UserStop)
}

func subscribeMessage(client *Client, data interface{}) {
	eventData := data.(map[string]interface{})
	val, ok := eventData["channelId"]
	if !ok {
		return
	}
	channelId, ok := val.(string)
	if !ok {
		return
	}
	cursor, err := r.Table("message").
		OrderBy(r.OrderByOpts{Index: r.Asc("createdAt")}).
		Filter(r.Row.Field("channelId").Eq(channelId)).
		Changes(r.ChangesOpts{IncludeInitial: true}).
		Run(client.session)
	if err != nil {
		client.send <- SocketMessage{"error", err.Error()}
		return
	}

	createSubscription(cursor, client, "message", MessageStop)
}

func unsubscribeChannel(client *Client, data interface{}) {
	client.StopForKey(ChannelStop)
}

func unsubscribeUser(client *Client, data interface{}) {
	client.StopForKey(UserStop)
}

func unsubscribeMessage(client *Client, data interface{}) {
	client.StopForKey(MessageStop)
}

func createSubscription(cursor *r.Cursor, client *Client, entityName string, stopKey int) {
	recordChan := make(chan r.ChangeResponse)
	cursor.Listen(recordChan)

	stopChan := client.NewStopChannel(stopKey)

	go func() {
		for {
			select {
			case <-stopChan:
				cursor.Close()
				return
			case change := <-recordChan:
				var command string
				var data interface{}
				if change.NewValue != nil && change.OldValue == nil {
					command = entityName + " add"
					data = change.NewValue
				}
				if change.NewValue == nil && change.OldValue != nil {
					command = entityName + " remove"
					data = change.OldValue
					fmt.Println("sent '" + entityName + " remove' msg")
				}
				if change.NewValue != nil && change.OldValue != nil {
					command = entityName + " edit"
					data = change.NewValue
				}
				client.send <- SocketMessage{command, data}
				fmt.Println("sent '"+command+"' msg ", data)
			}
		}
	}()
}
