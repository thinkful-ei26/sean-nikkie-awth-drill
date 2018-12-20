import {createStore, applyMiddleware, combineReducers} from 'redux';
import {reducer as formReducer} from 'redux-form';
import thunk from 'redux-thunk';
// import {loadAuthToken} from './local-storage';
import authReducer from './reducers/auth';
import protectedDataReducer from './reducers/protected-data';
// import {setAuthToken, refreshAuthToken} from './actions/auth';

const store = createStore(
    combineReducers({
        form: formReducer,
        auth: authReducer,
        protectedData: protectedDataReducer
    }),
    applyMiddleware(thunk)
);

// Hydrate the authToken from localStorage if it exist
// const authToken = loadAuthToken();
// if (authToken) {
//     console.log ('in the store');
//     const token = authToken;
//     store.dispatch(setAuthToken(token));
//     store.dispatch(refreshAuthToken());
// }
//when we refresh the page it gives us a new token 

export default store;
