import React, { useState, useEffect } from 'react';
import { AsyncStorage } from 'react-native';
import { useDispatch } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { getLatLong } from '../helpers/geo';
import { setLocation } from '@/actions/location';
import { setUser } from '@/actions/user';
import { setFilter } from '@/actions/filter';
import { setNotificationRedirect } from '@/actions/notifications';
import { Loader } from '@/components';
import MainTabNavigator from './MainTabNavigator';
import { Notifications } from 'expo';
import { getUserInfo } from '@/services/user';
import { getPrayerByID } from '@/services/prayer';
import i18n from 'i18next';
import { formatLanguage } from '@/helpers/dateFormat';
import { Notification } from 'expo/build/Notifications/Notifications.types';

export default ({ user }) => {
  const [userDataFetched, setUserDataFetched] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    init();

    const listener = Notifications.addListener(handleNotification);

    return () => {
      // unsubscribe listener
      listener.remove();
    };
  }, []);

  useEffect(() => {
    if (user) {
      (async () => {
        try {
          const userInfo = await getUserInfo(user.uid);

          initLanguage(userInfo.locale);
          setUserDataFetched(true);
          dispatch(setUser(userInfo));
        } catch (e) {
          console.log(e);
        }
      })();
    } else {
      setUserDataFetched(true);
    }
  }, [user]);

  async function init() {
    // get user location
    try {
      const location = await getLatLong();
      dispatch(setLocation(location));
    } catch (e) {
      dispatch(setLocation({ latitude: 0, longitude: 0 }));
    }

    // setInterval(async () => {
    //   // update user's current position every 30 seconds
    //   try {
    //     const location = await getLatLong();
    //     dispatch(setLocation(location));
    //   } catch (e) {
    //     dispatch(setLocation({ latitude: 0, longitude: 0 }));
    //   }
    // }, 30 * 1000);

    await initFilter();
  }

  async function initLanguage(locale: string) {
    i18n.changeLanguage(locale);
    formatLanguage(locale);
  }

  async function initFilter() {
    const prayersFilter = await AsyncStorage.getItem('prayersFilter');
    if (prayersFilter) {
      dispatch(setFilter(JSON.parse(prayersFilter)));
    }
  }

  async function handleNotification(notification: Notification) {
    if (notification.remote && notification.origin === 'selected') {
      if (notification.data.id) {
        const prayer = await getPrayerByID(notification.data.id);
        dispatch(setNotificationRedirect({ screen: 'PrayerDetail', payload: prayer }));
      }
    }

    // "notification": Object {
    //   "actionId": null,
    //   "data": Object {
    //     "id": "de43ec2a-05be-4d63-99dc-7cb63394d2c7",
    //   },
    //   "origin": "received",
    //   "remote": true,
    //   "userText": null,
    // },
  }

  if (!userDataFetched) {
    return <Loader />;
  }

  return (
    <NavigationContainer>
      <MainTabNavigator />
    </NavigationContainer>
  );
};
