import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Modules from './pages/Modules';
import ModuleDetail from './pages/ModuleDetail';
import Profile from './pages/Profile';
import Peserta from './pages/Peserta';
import Chat from './pages/Chat';
import Pemateri from './pages/Pemateri';
import ContentDetail from './pages/ContentDetail';
import Settings from './pages/Settings';
import Kalender from './pages/Kalender';

import { authService } from './services/auth.service';

/* Core CSS */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import './theme/variables.css';
import './global.css';

setupIonicReact();

// Guard Route
const PrivateRoute: React.FC<{ component: React.FC<any>; path: string; exact?: boolean }> = ({
  component: Component, ...rest
}) => (
  <Route
    {...rest}
    render={(props) =>
      authService.isLoggedIn()
        ? <Component {...props} />
        : <Redirect to="/login" />
    }
  />
);

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        {/* Public */}
        <Route exact path="/login" component={Login} />
        <Route exact path="/register" component={Register} />

        {/* Private */}
        <PrivateRoute exact path="/dashboard" component={Dashboard} />
        <PrivateRoute exact path="/modules" component={Modules} />
        <PrivateRoute exact path="/modules/:id" component={ModuleDetail} />
        <PrivateRoute exact path="/profile" component={Profile} />
        <PrivateRoute exact path="/peserta" component={Peserta} />
        <PrivateRoute exact path="/chat" component={Chat} />
        <PrivateRoute exact path="/pemateri" component={Pemateri} />
        <PrivateRoute exact path="/contents/:id" component={ContentDetail} />
        <PrivateRoute exact path="/settings" component={Settings} />
        <PrivateRoute exact path="/kalender" component={Kalender} />

        {/* Default */}
        <Route exact path="/">
          <Redirect to={authService.isLoggedIn() ? '/dashboard' : '/login'} />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
