import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function Banner() {
  return (
    <View style={styles.banner}>
      <Image
        source={require('@/assets/images/banner.jpg')}
        style={styles.bannerImage}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
        priority="high"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    height: 200,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
});
