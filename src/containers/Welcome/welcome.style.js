import styled from 'styled-components';
import { media } from '../../utils';

export const WelcomeWrapper = styled.section`
  overflow:auto;
  position:absolute;
  padding: 50px 0;
  width:100%;
  height:100%;
  align-items: center;
  justify-content: center;
  h3 {
    color: #666666;
    span {
      font-weight: bold;
    }
    a {
      font-size: 1.9rem;
    }
  }
`;

export const WelcomeCard = styled.div`
  background-color: #fff;
  margin: 30px auto;

  //Overriding the style guide card flexbox settings
  max-width: 80% !important;
  flex-direction: row !important;
  padding: 50px 0 !important; //temporary fix to a style guide bug

  align-items: center;

  a {
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  button {
    margin-left: 8px;
  }

`;

export const WelcomeLogo = styled.div`
  width: 50%;
  height: 100%;

  img {
    width: 60%;
    display: block;
    margin: 0 auto;
  }
`;

export const WelcomeProfile = styled.div`
  height: 100%;
  text-align: center;
  position: relative;

  img {
    width: 120px;
    height: 120px;
    border-radius: 50%;
  }

  h1 {
    color: #7c4dff;
    font-size: 500%;
  },
  img {
    margin: 0 10px;
    display: inline-block;
    vertical-align: middle;
  }

  ${media.tablet`
    width: 50%;
    &:after {
      display: block;
      content: "";
      position: absolute;
      height: 100%;
      top:0;
    }
  `}
`;

export const ImageWrapper = styled.div`
display: flex;
justify-content: center;
align-items: center;
`

export const ImageContainer =  styled.div`
  background-image: ${({image}) => image ? `url(${image})`: '#cccccc'};
  background-size: cover;
  border-radius: 50%;
  width: 128px;
  height: 128px;
  `;

export const WelcomeDetail = styled.div`
  padding: 1rem 3.5rem;

  p,
  li {
    color: #666666;
  }
  ul {
    list-style: disc;
    margin: 0 18px;
  }
`;
