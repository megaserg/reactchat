import React, {Component} from "react";
import Message from "./Message.jsx";

class MessageList extends Component {
  render() {
    return (
      <ul>{
        this.props.messages.map(msg => {
          return (
            <Message
              message={msg}
              key={msg.id}
            />
          );
        })
      }</ul>
    );
  }
}

MessageList.propTypes = {
  messages: React.PropTypes.array.isRequired
}

export default MessageList;
