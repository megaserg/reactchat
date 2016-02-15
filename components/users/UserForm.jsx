import React, {Component} from "react";

class UserForm extends Component {
  onSubmit(e) {
    e.preventDefault();
    const userNameNode = this.refs.userName;
    const userName = userNameNode.value;
    this.props.setUserName(userName);
    userNameNode.value = "";
  }
  render() {
    return (
      <form onSubmit={this.onSubmit.bind(this)}>
        <div className="form-group">
          <input
            className="form-control"
            placeholder="Edit username"
            type="text"
            ref="userName" />
        </div>
      </form>
    );
  }
}

UserForm.propTypes = {
  setUserName: React.PropTypes.func.isRequired
}

export default UserForm;
