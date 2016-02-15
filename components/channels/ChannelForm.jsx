import React, {Component} from "react";

class ChannelForm extends Component {
  onSubmit(e) {
    e.preventDefault();
    const channelNameNode = this.refs.channel;
    const channelName = channelNameNode.value;
    this.props.addChannel(channelName);
    channelNameNode.value = "";
  }
  render() {
    return (
      <form onSubmit={this.onSubmit.bind(this)}>
        <div className="form-group">
          <input
            className="form-control"
            placeholder="Add channel"
            type="text"
            ref="channel" />
        </div>
      </form>
    );
  }
}

ChannelForm.propTypes = {
  addChannel: React.PropTypes.func.isRequired
}

export default ChannelForm;
