import styled from 'styled-components';

import { media } from '../../utils';

export const ProfileWrapper = styled.section`
    width:100%;
    height:100%;
    position:absolute;
    overflow:hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background-image: url('/img/background-brown-carpentry-326311.jpg');
    background-repeat: no-repeat;
    background-attachment: fixed;
    background-size:100% 100%;
    min-height: 79vh;
    padding: 60px 0;
    margin: 0;
    
`;
export const ProfileContainer = styled.div`
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
    background-color: white;
    max-width: 900px;
    margin:10%,10%;
    position:relative;
    border-radius:10px;
    width:100%;
    overflow-y: auto;
    ${media.tablet`
    height: 65em;;
  `}
`;

export const Header = styled.div`
    display: flex;
    position: relative;
    align-items: center;
    justify-content: center;
    background-image: url('/img/pattern-geo.png'),
        linear-gradient(135deg, #7c4dff 0%, #18a9e6 50%, #01c9ea 100%);
    background-repeat: repeat, no-repeat;
    padding: 30px 20px;

    .edit-button {
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid white;
        color: white;
        position: absolute;
        right: 20px;
        top: 20px;
        font-size: 1rem;
    }
`;

export const Form = styled.form`
    padding: 20px 40px;
    align-items: center;
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: 20px 40px;
    ${media.tablet`
    grid-template-columns: 1fr 1fr;
  `}
`;

export const Button = styled.button`
    max-width: 128px;
    display: inline-block;

    &:first-child {
        margin-right: 10px;
    }
`;

export const FullGridSize = styled.div`
    grid-column: span 1;
    text-align: right;
    ${media.tablet`
    grid-column: span 2;
  `}
`;

export const WebId = styled.div`
    padding: 20px 40px 0px 40px;
    position: relative;
    &:after{
      background-color: #d8d8d8;
    display: block;
    content: "";
    height: 1px;
    width: 100%;
    margin: 25px 0 0 0;
    }
    a {
        display: inline-block;
        word-break: break-all;
        margin-left: 10px;
    }
`;

export const ShexForm = styled.div`
border: solid #cacaca 1px;
background: #f9f9f9;
    label {
      clear: both;
    }
    & .shexForm {
        border: none;
        background: transparent;
        box-sizing: border-box;
        padding: 0 12px;
    }

    & .shexPanel {
        border: solid #cacaca 1px;
        background: #ffffff;
        box-sizing: border-box;
        padding: 12px;
        position: relative;
    }

    & .shexRoot {
        border: none;
        background: transparent;
    }

    & .deleteButton {
        margin: 0 4px 0 12px;
        position: relative;
        float: right;
        width: 100px;
        color: #fb4a3e;
        border-color: #fb4a3e;
        &:hover {
            background: rgba(251, 74, 62, 0.8);
            color: #fff;
        }
    }

    & .addButton {
        width: 210px;
        color: rgb(145, 194, 250);
        border-color: rgb(145, 194, 250);
        background: #fff;
        padding: 5px 30px;
        &:hover {
            background: rgba(145, 194, 250, 0.8);
            color: #fff;
        }

        & .inputContainer {
            padding: 12px;
        }
    }
`;

export const DeleteNotification = styled.section`
  margin-bottom:0px !important;
`;
