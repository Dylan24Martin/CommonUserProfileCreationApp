import React from "react";
import { NavLink } from "react-router-dom";

type Props = {
  navigation: Object
};

const Navigation = ({ navigation }: Props) => {
  return (
    <nav role="navigation" className="nav nav__primary">
      <ul>
          <li style={{width:'7.3em'}} key='welcome'>
            <NavLink to='/welcome' activeClassName="active">
              <span style={{margin:0}} className="icon">
                <img src={'/img/icon/apps.svg'} alt='welcome' className="nav-icon" />
              </span>
              <span className="label">{'Welcome'}</span>
            </NavLink>
          </li>
          <li style={{width:'7.3em'}} key={'profile'}>
            <NavLink to={'/profile'} activeClassName="active">
              <span className="icon">
                <img src={'/img/background.svg'} alt={'profile'} className="nav-icon" />
              </span>
              <span className="label">{'Create'}</span>
            </NavLink>
          </li>
          <li style={{width:'7.3em'}} key={'view'}>
            <NavLink to={'/view'} activeClassName="active">
              <span className="icon">
                <img src={'/img/icons8-login-as-user.svg'} alt={'view'} className="nav-icon" />
              </span>
              <span className="label">{'View'}</span>
            </NavLink>
          </li>
      </ul>
    </nav>
  );
};

export default Navigation;
