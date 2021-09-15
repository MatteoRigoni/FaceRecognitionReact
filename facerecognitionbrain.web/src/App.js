import './App.css';
import Navigation from './components/navigation/Navigation';
import Logo from './components/logo/Logo';
import ImageLinkForm from './components/imagelinkform/ImageLinkForm';
import Rank from './components/rank/Rank';
import FaceRecognition from './components/facerecognition/FaceRecognition';
import SignIn from './components/signin/SingIn';
import Register from './components/register/Register';
import 'tachyons';
import Particles from 'react-particles-js';
import { Component } from 'react';
import Clarifai from 'clarifai';

const app = new Clarifai.App({
  apiKey: 'c1c3af48654e4c77a2fddd06d31a85e3',
});

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        email: '',
        name: '',
        entries: 0,
        joined: new Date()
      }
    }
  }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        email: data.email,
        name: data.name,
        entries: data.entries,
        joined: data.joined
      }
    });
    this.setState({
      imageUrl: ''
    });
  }

  calculateFaceLocation = (data) => {
    console.log('calculateFaceLocation');
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);

    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    };
  }

  displayFaceBox = (box) => {
    this.setState({ box: box });
  }

  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  }

  onButtonSubmit = () => {
    this.setState({ imageUrl: this.state.input });

    app.models.predict(
      Clarifai.FACE_DETECT_MODEL,
      this.state.input)
      .then(res => { 
        if (res) {
          fetch('http://localhost:3000/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                id: this.state.user.id
            })
          })
          .then(response => response.json())
          .then(upadtedUser => {
            this.setState({user: upadtedUser})
          })
        }
        this.displayFaceBox(this.calculateFaceLocation(res)) })
      .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    console.log(route);
    if (route === 'signout') {
      this.setState({ isSignedIn: false });
    } else if (route === 'home') {
      this.setState({ isSignedIn: true });
    }

    this.setState({ route: route });
  }

  render() {
    // const { isSignedIn, imageUrl, route, box } = this.state;

    return (
      <div className="App">
        <Particles
          style={{ position: "absolute", zIndex: -1 }}
          height="95%"
          width="95%"
          params={{
            particles: {
              color: {
                value: "#000000"
              },
              line_linked: {
                color: {
                  value: "#000000"
                }
              },
              number: {
                value: 50
              },
              size: {
                value: 3
              }
            }
          }}
        />

        <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange} />
        {
          this.state.route === 'home'
            ?
            <div>
              <Logo />
              <Rank name={this.state.user.name} entries={this.state.user.entries} />
              <ImageLinkForm
                onInputChange={this.onInputChange}
                onButtonSubmit={this.onButtonSubmit} />
              <FaceRecognition imageUrl={this.state.imageUrl} box={this.state.box} />
            </div>
            : (
              this.state.route === 'signin'
                ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
                : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
            )
        }
      </div>
    )
  };
}

export default App;
