import React from 'react';

class Register extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            registrationEmail: '',
            registrationPassword: '',
            registrationName: ''
        }
    }

    onEmailChange = (event) => {
        this.setState({ registrationEmail: event.target.value });
    };
    onPasswordChange = (event) => {
        this.setState({ registrationPassword: event.target.value });
    };
    onNameChange = (event) => {
        this.setState({ registrationName: event.target.value });
    };
    onSubmitSignIn = () => {
        fetch('http://localhost:3000/register', {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                email: this.state.registrationEmail,
                password: this.state.registrationPassword,
                name: this.state.registrationName
            })
        })
        .then(response => response.json())
        .then(user => {
            if (user) {
                this.props.loadUser(user);
                this.props.onRouteChange('home');
            }
        });
    }

    render() {
        const { onRouteChange } = this.props;

        return (
            <article class="br2 ba dark-gray b--black-10 mv4 w-100 w-50-m w-25-l mw5 center">
                <main class="pa4 black-80">
                    <div class="measure">
                        <fieldset id="sign_up" class="ba b--transparent ph0 mh0">
                            <legend class="f4 fw6 ph0 mh0">Register</legend>
                            <div class="mt3">
                                <label class="db fw6 lh-copy f6" htmlFor="email-address">Name</label>
                                <input onChange={this.onNameChange} class="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" type="text" name="name" id="name" />
                            </div>
                            <div class="mt3">
                                <label class="db fw6 lh-copy f6" htmlFor="email-address">Email</label>
                                <input onChange={this.onEmailChange} class="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" type="email" name="email-address" id="email-address" />
                            </div>
                            <div class="mv3">
                                <label class="db fw6 lh-copy f6" htmlFor="password">Password</label>
                                <input onChange={this.onPasswordChange} class="b pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" type="password" name="password" id="password" />
                            </div>
                        </fieldset>
                        <div class="">
                            <input class="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib" type="submit" value="Register" onClick={this.onSubmitSignIn} />
                        </div>
                    </div>
                </main>
            </article>
        )
    };
}

export default Register;