import React, {Component} from "react";

class MessageForm extends Component {
  onSubmit(e) {
    e.preventDefault();
    const messageNode = this.refs.messageBody;
    const messageBody = messageNode.value;
    this.props.addMessage(messageBody);
    messageNode.value = "";
  }
  render() {
    let input;
    if (this.props.activeChannel.id !== undefined) {
      input = (
        <input
          className="form-control"
          placeholder="Send message..."
          type="text"
          ref="messageBody" />
      );
    }
    return (
      <form onSubmit={this.onSubmit.bind(this)}>
        <div className="form-group">
          {input}
        </div>
      </form>
    );
  }
}

MessageForm.propTypes = {
  addMessage: React.PropTypes.func.isRequired,
  activeChannel: React.PropTypes.object.isRequired
}

export default MessageForm;
