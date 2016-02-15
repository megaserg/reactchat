import React, {Component} from "react";
import ChannelSection from "./channels/ChannelSection.jsx";
import MessageSection from "./messages/MessageSection.jsx";
import UserSection from "./users/UserSection.jsx";
import Socket from "../js/socket.js"

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      channels: [],
      users: [],
      messages: [],
      activeChannel: {},
      connected: false
    };
  }
  componentDidMount() {
    let ws = new WebSocket("ws://localhost:4000");
    let socket = this.socket = new Socket(ws);

    socket.whenServerSays("connect", this.onConnect.bind(this));
    socket.whenServerSays("disconnect", this.onDisconnect.bind(this));

    socket.whenServerSays("channel add", this.onAddChannel.bind(this));

    socket.whenServerSays("user add", this.onAddUser.bind(this));
    socket.whenServerSays("user edit", this.onEditUser.bind(this));
    socket.whenServerSays("user remove", this.onRemoveUser.bind(this));

    socket.whenServerSays("message add", this.onAddMessage.bind(this));

    socket.whenServerSays("error", (e) => {console.log("oops", e)});
  }

  onConnect() {
    this.setState({connected: true});
    this.socket.sendMessageToServer("channel subscribe");
    this.socket.sendMessageToServer("user subscribe");
  }
  onDisconnect() {
    this.setState({connected: false});
  }

  onAddChannel(channel) {
    let {channels} = this.state;
    channels.push(channel);
    this.setState({channels});
  }
  addChannel(name) {
    this.socket.sendMessageToServer("channel add", {name});
  }
  setChannel(activeChannel) {
    this.setState({activeChannel});
    this.socket.sendMessageToServer("message unsubscribe");
    this.setState({messages: []});
    this.socket.sendMessageToServer("message subscribe", { channelId: activeChannel.id });
  }

  onAddUser(user) {
    let {users} = this.state;
    users.push(user);
    this.setState({users});
  }
  onEditUser(editUser) {
    let {users} = this.state;
    users = users.map(user => {
      if (user.id === editUser.id) {
        return editUser;
      }
      return user;
    });
    this.setState({users});
  }
  onRemoveUser(removeUser) {
    let {users} = this.state;
    users.filter(user => {
      return user !== removeUser;
    });
    this.setState({users});
  }
  setUserName(name) {
    this.socket.sendMessageToServer("user edit", {name});
  }

  onAddMessage(message) {
    let {messages} = this.state;
    messages.push(message);
    this.setState({messages});
  }
  addMessage(body) {
    let {activeChannel} = this.state;
    this.socket.sendMessageToServer("message add",
      {channelId: activeChannel.id, body});
  }

  render() {
    return (
      <div className="app">
        <div className="nav">
          <ChannelSection
            {...this.state}
            addChannel={this.addChannel.bind(this)}
            setChannel={this.setChannel.bind(this)}
          />
          <UserSection
            users={this.state.users}
            setUserName={this.setUserName.bind(this)}
          />
        </div>
        <MessageSection
          messages={this.state.messages}
          activeChannel={this.state.activeChannel}
          addMessage={this.addMessage.bind(this)}
        />
      </div>
    );
  }
}

export default App
