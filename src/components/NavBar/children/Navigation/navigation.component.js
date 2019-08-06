import React from "react";
import { NavLink } from "react-router-dom";

type Props = {
  navigation: Object
};

const Navigation = ({ navigation }: Props) => {
  return (
    <nav role="navigation" className="nav nav__primary">
      <ul>
            <li key='welcome'>
              <NavLink to='/welcome' activeClassName="active">
                <span className="icon">
                  <img src={'/img/icon/apps.svg'} alt='welcome' className="nav-icon" />
                </span>
                <span className="label">{'Welcome'}</span>
              </NavLink>
            </li>
            <li key={'profile'}>
            <NavLink to={'/profile'} activeClassName="active">
              <span className="icon">
                <img src={'/img/background.svg'} alt={'profile'} className="nav-icon" />
              </span>
              <span className="label">{'Create'}</span>
            </NavLink>
          </li>
      </ul>
    </nav>
  );
};

export default Navigation;
