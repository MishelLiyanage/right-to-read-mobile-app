import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

export default function Banner() {
  return (
    <View style={styles.banner}>
      <Image
        source={require('@/assets/images/banner.jpg')}
        style={styles.bannerImage}
        contentFit="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    height: 200,
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
});
