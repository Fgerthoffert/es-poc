import React from 'react';

import { storiesOf } from '@storybook/react';

import { Provider } from 'react-redux';
import { init } from "@rematch/core";

import App from '../App.js';

//https://medium.com/ingenious/storybook-meets-redux-6ab09a5be346
import * as models from "../redux/index.mock.js";
const store = init({
    models
});

storiesOf('Velocity', module)
    .addDecorator(story => <Provider store={store}>{story()}</Provider>)
    .add('Entire App', () => (
        <App />
    ));
