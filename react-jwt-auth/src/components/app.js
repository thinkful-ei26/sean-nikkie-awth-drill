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
            idle: false
        };
    }

    componentDidUpdate(prevProps) //compares how prop was before and how it is now 
    {
        if (!prevProps.loggedIn && this.props.loggedIn) //if we werent logged in and now we are, do this: 
        {
            // When we are logged in, refresh the auth token periodically
            this.startPeriodicRefresh();
            this.startIdleTimer();
            // this.fiveMinutesInactivity();
        } else if (prevProps.loggedIn && !this.props.loggedIn) //if we were logged but now we're not, stop: 
        {
            // Stop refreshing when we log out
            this.stopPeriodicRefresh();
            this.stopIdleTimer();
            this.stopLogOutTimer();
            console.log('in the else if for component update')
        }
    }

    componentWillUnmount() {
        this.stopPeriodicRefresh();
        this.stopIdleTimer();
        this.stopLogOutTimer();
    }

    startPeriodicRefresh() {
        this.refreshInterval = setInterval(
            () => this.props.dispatch(refreshAuthToken()),
            10 * 60 * 1000 // ten minutes
        );
    }

    startIdleTimer(){
        this.idleInterval = setInterval(()=>{
            this.setState({
                idle:true,
            })
            this.stopIdleTimer();
            this.startLogOutTimer();
            console.log('idle true');
        }, 5*1000)
    }

    startLogOutTimer(){
        clearInterval(this.logoutInterval);
        this.logoutInterval= setInterval(()=>{
            console.log('the state',this.state.idle);
            if(this.state.idle===true)
            {
                this.props.dispatch(clearAuth());
            }

        },5* 1000 )
    }

    stopLogOutTimer(){
        if(!this.logoutInterval){
            return;
        }
        this.setState({
            idle: false,
        })
        clearInterval(this.logoutInterval);
    }

    stopIdleTimer(){
        if(!this.idleInterval){
            return;
        }

        clearInterval(this.idleInterval);
    }

    restartIdleTimer(){
        if(!this.idleInterval){
            return;
        }
        clearInterval(this.idleInterval);
        this.startIdleTimer();
    }


    stopPeriodicRefresh() {
        if (!this.refreshInterval) {
            return;
        }

        clearInterval(this.refreshInterval);
    }


    render() {
        let dialog_box = (
            <div className = "dialog_box">
                <h3>Are you still there? You will be logged out soon due to inactivity!</h3>
                <button onClick={()=> {
                    this.setState({idle:false});
                    this.stopLogOutTimer();
                }} type="button">Still here!</button>
            </div>
        );
        return (
            <div className="app" onMouseMove={ ()=> {                 
                    if(this.props.loggedIn){
                        this.restartIdleTimer();
                    }
                }   
                }>
                <HeaderBar />
                {this.state.idle && dialog_box}
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
