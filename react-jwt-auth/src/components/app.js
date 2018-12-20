import React from 'react';
import {connect} from 'react-redux';
import {Route, withRouter} from 'react-router-dom';

import HeaderBar from './header-bar';
import LandingPage from './landing-page';
import Dashboard from './dashboard';
import RegistrationPage from './registration-page';
import {refreshAuthToken} from '../actions/auth';
import {clearAuth} from '../actions/auth';

import './app.css'

export class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inactive: false
        };
    }
    componentDidUpdate(prevProps) {
        if (!prevProps.loggedIn && this.props.loggedIn) {
            // When we are logged in, refresh the auth token periodically
            this.startPeriodicRefresh();
            this.fiveMinutesInactivity();
        } else if (prevProps.loggedIn && !this.props.loggedIn) {
            // Stop refreshing when we log out
            this.stopPeriodicRefresh();
            this.stopFiveMinuteInactivity();
        }
    }

    componentWillUnmount() {
        this.stopPeriodicRefresh();
    }

    startPeriodicRefresh() {
        this.refreshInterval = setInterval(
            () => this.props.dispatch(refreshAuthToken()),
            10 * 60 * 1000 // ten minutes
        );
    }

    // fiveMinutesInactivity() {
    //     this.inactivityInterval = setInterval(
    //         () => this.props.dispatch(clearAuth()),
    //         1 * 60 * 1000
    //     );
    // }

    fiveMinutesInactivity() {
        this.inactivityInterval = setInterval(() => {
            /*display dialogue*/
            // let clicked = Window.confirm('Are you still here?');
            // console.log(clicked);
            this.setState({inactive: true});
            setInterval(() => {this.props.dispatch(clearAuth()); this.setState({inactive: false})}, 60 * 1000)
        }, 4 * 60 * 1000);
    }
    // setInterval(fn that we want to do after time, time)

    stopPeriodicRefresh() {
        if (!this.refreshInterval) {
            return;
        }

        clearInterval(this.refreshInterval);
    }

    stopFiveMinuteInactivity() {
        if (!this.inactivityInterval) {
            return;
        } //if we've already cleared it, leave

        clearInterval(this.inactivityInterval);
    }
    render() {
        let dialog_box = (
            <div className = "dialog_box">
                <h3>Are you still there? You will be logged out soon due to inactivity!</h3>
                <button onClick={()=> {
                    this.stopFiveMinuteInactivity();
                    this.fiveMinutesInactivity();
                    this.setState({inactive:false});
                }} type="button">Still here!</button>
            </div>
        );
        return (
            <div className="app">
                <HeaderBar />
                {this.state.inactive ? dialog_box : undefined}
                <Route exact path="/" component={LandingPage} />
                <Route exact path="/dashboard" component={Dashboard} />
                <Route exact path="/register" component={RegistrationPage} />
            </div>
        );
    }
}

const mapStateToProps = state => ({
    hasAuthToken: state.auth.authToken !== null,
    loggedIn: state.auth.currentUser !== null
});

// Deal with update blocking - https://reacttraining.com/react-router/web/guides/dealing-with-update-blocking
export default withRouter(connect(mapStateToProps)(App));
