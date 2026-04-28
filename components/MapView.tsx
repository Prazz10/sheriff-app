import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

interface MapComponentProps {
  latitude: number;
  longitude: number;
  markers?: Array<{
    id: string;
    latitude: number;
    longitude: number;
    title?: string;
    description?: string;
  }>;
  showUserLocation?: boolean;
  style?: any;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  latitude,
  longitude,
  markers = [],
  showUserLocation = true,
  style,
}) => {
  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={[styles.map, style]}
      initialRegion={{
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      showsUserLocation={showUserLocation}
      showsMyLocationButton
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={{
            latitude: marker.latitude,
            longitude: marker.longitude,
          }}
          title={marker.title}
          description={marker.description}
        />
      ))}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
