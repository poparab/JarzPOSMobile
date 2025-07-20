import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { POSScreen } from '../POSScreen';
import { KanbanScreen } from '../KanbanScreen';

export type SessionDrawerParamList = {
  POS: undefined;
  Kanban: undefined;
};

const Drawer = createDrawerNavigator<SessionDrawerParamList>();

export function SessionStack(): React.ReactElement {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
      }}
    >
      <Drawer.Screen
        name="POS"
        component={POSScreen}
        options={{ title: 'Point of Sale' }}
      />
      <Drawer.Screen
        name="Kanban"
        component={KanbanScreen}
        options={{ title: 'Orders Board' }}
      />
    </Drawer.Navigator>
  );
}
