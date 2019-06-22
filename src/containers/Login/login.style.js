import styled from "styled-components";
import { GradientBackground, Panel } from "@util-components";

export const LoginWrapper = styled.div`
background-image: url('/img/background-brown-carpentry-326311.jpg');
overflow:scroll;
position:absolute;
background-repeat: no-repeat;
background-attachment: fixed;
padding: 50px 0;
width:100%;
height:100%;
align-items: center;
justify-content: center;
background-size:100% 100%;
  h1 {
    color: #ffffff;
    // font-size:50px
  },
  // span {
  //   color: #ffffff;
  //   padding:10px;
  //   font-weight:bold;
  //   font-size:30px
  // }
`;

export const LoginPanel = styled(Panel)``;

export const PanelBody = styled.div`
  display: grid;
  flex-direction: column;
  
  .provider-login-component {
    div[role=option] {
      text-align: left !important;
      padding-left: 20px;
    }
  }
`;

export const LoginTitle = styled.span`
  color: #656e75;
  font-family: Raleway;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 1.2px;
  line-height: 19px;
  text-align: center;
  position: relative;
  margin: 30px 0;
  display: inline-block;
  width: 100%;

  &::before,
  &::after {
    width: 37%;
    content: "";
    background: #656e75;
    height: 1px;
    position: absolute;
    box-sizing: border-box;
    top: 50%;
  }

  &::before {
    right: 0;
  }

  &::after {
    left: 0;
  }
`;
