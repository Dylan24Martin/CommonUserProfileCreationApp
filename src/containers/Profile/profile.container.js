import React from 'react';
import { withToastManager } from 'react-toast-notifications';
import { useWebId} from '@inrupt/solid-react-components';
import {
    ProfileContainer,
    ProfileWrapper,
} from './profile.style';
import Form from './form.js';

/**
 * We are using ldflex to fetch profile data from a solid pod.
 * ldflex libary is using json-LD for this reason you will see async calls
 * when we want to get a field value, why ? becuase they are expanded the data
 * this means the result will have a better format to read on Javascript.
 * for more information please go to: https://github.com/solid/query-ldflex
 */

const Profile = () => {
    const webId = useWebId();

    return (
        <ProfileWrapper data-testid="profile-component">
            <ProfileContainer>
                {webId && (
                    <Form webid={webId} />
                )}
            </ProfileContainer>
        </ProfileWrapper>
    );
};

export default withToastManager(Profile);
