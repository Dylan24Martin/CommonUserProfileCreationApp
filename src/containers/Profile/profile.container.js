import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { withToastManager } from 'react-toast-notifications';
import { useWebId, ShexFormBuilder } from '@inrupt/solid-react-components';
import {
    Header,
    ProfileContainer,
    ProfileWrapper,
    ShexForm,
    DeleteNotification,
    WebId,
} from './profile.style';
import Form from './form.js';
const defaultProfilePhoto = '/img/icon/empty-profile.svg';

/**
 * We are using ldflex to fetch profile data from a solid pod.
 * ldflex libary is using json-LD for this reason you will see async calls
 * when we want to get a field value, why ? becuase they are expanded the data
 * this means the result will have a better format to read on Javascript.
 * for more information please go to: https://github.com/solid/query-ldflex
 */

const Profile = ({ toastManager }) => {
    const webId = useWebId();
    const { t, i18n } = useTranslation();

    const successCallback = () => {
        toastManager.add(['Success', t('profile.successCallback')], {
            appearance: 'success',
        });
    };

    const errorCallback = e => {
        const code = e.code || e.status;
        const messageError = code
            ? `profile.errors.${code}`
            : `profile.errors.default`;
        if (code && code !== 200)
            toastManager.add(['Error', t(messageError)], {
                appearance: 'error',
            });
    };

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
