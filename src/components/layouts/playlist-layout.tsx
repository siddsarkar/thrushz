import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { SongListItem } from '../song/SongListItem';

export type PlaylistSong = {
  id: string;
  title: string;
  image?: string;
};

export type PlaylistLayoutProps = {
  title: string;
  listCount: number;
  image: string;
  description: string;
  songs: PlaylistSong[];
  onItemPress?: (item: PlaylistSong) => void;
};

export function PlaylistLayout(props: PlaylistLayoutProps) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const translateHeader = scrollY.interpolate({
    inputRange: [0, 260],
    outputRange: [0, -260],
    extrapolate: 'clamp',
  });
  const opacityImage = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const opacityTitle = scrollY.interpolate({
    inputRange: [100, 150],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const translateImage = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 40],
    extrapolate: 'clamp',
  });
  const translateTitle = scrollY.interpolate({
    inputRange: [200, 240],
    outputRange: [0, 40],
    extrapolate: 'clamp',
  });
  const scaleTitle = scrollY.interpolate({
    inputRange: [200, 240],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  return (
    <View style={{ backgroundColor: '#05141c', position: 'relative' }}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: 120,
          width: 80,
          aspectRatio: 1,
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
        }}
      >
        <FontAwesome5 name="arrow-left" size={20} color="white" />
      </View>
      <Animated.View
        style={[
          styles.header,
          {
            transform: [{ translateY: translateHeader }],
            // position: 'relative',
          },
        ]}
      >
        <Animated.Image
          source={{
            uri: props.image,
          }}
          style={[
            styles.headerTitle,
            { flex: 1, marginTop: 80, aspectRatio: 1 },
            { opacity: opacityImage },
            { transform: [{ translateY: translateImage }] },
          ]}
        />

        <Animated.Text
          style={[
            styles.playlistTitle,
            // { transform: [{ scale: scaleTitle }] },
            { opacity: opacityTitle },
            {
              transform: [
                { translateX: translateTitle },
                { scale: scaleTitle },
              ],
            },
          ]}
        >
          {props.title}
        </Animated.Text>

        <View>
          <Animated.Text
            style={[
              styles.playlistTitle2,
              // { transform: [{ scale: scaleTitle }] },
              { opacity: opacityImage },
              {
                transform: [
                  { translateX: translateTitle },
                  { scale: scaleTitle },
                ],
              },
            ]}
          >
            {props.title}
          </Animated.Text>
          <Animated.Text style={[styles.subtitle, { opacity: opacityImage }]}>
            {props.listCount} songs
          </Animated.Text>
        </View>
      </Animated.View>
      <Animated.FlatList
        contentContainerStyle={styles.content}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: true,
          }
        )}
        data={props.songs}
        scrollEventThrottle={1}
        renderItem={({ item }: { item: PlaylistSong }) => (
          <SongListItem
            title={item.title}
            image={item.image}
            onPress={() => props.onItemPress?.(item)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
    paddingTop: 350 + 12,
    // backgroundColor: '#fff',
  },
  header: {
    position: 'absolute',
    width: '100%',
    zIndex: 1,
    paddingHorizontal: 24,
    paddingVertical: 12,
    height: 350,
    alignItems: 'stretch',
    justifyContent: 'flex-end',
    backgroundColor: '#05141c',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: '#fafdcc',
    textAlign: 'center',
    marginHorizontal: 'auto',
  },
  playlistTitle: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: 'bold',
    color: '#fff',
    // textAlign: 'center',
    // marginBottom: 12,
    marginRight: 'auto',
    transformOrigin: 'left',
    position: 'absolute',
    bottom: 12,
    left: 20,
  },
  playlistTitle2: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: 'bold',
    color: '#fff',
    marginHorizontal: 'auto',
    textAlign: 'center',
  },
  headerTitle: {
    // fontSize: 26,
    // lineHeight: 34,
    // fontWeight: 'bold',
    // color: '#fff',
    // textAlign: 'center',
    // marginBottom: 12,
    marginHorizontal: 'auto',
  },
  input: {
    height: 44,
    backgroundColor: '#fff',
    paddingLeft: 44,
    paddingRight: 24,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
  },
  inputIcon: {
    position: 'absolute',
    width: 44,
    height: 44,
    top: 0,
    left: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  cardImg: {
    width: 120,
    height: 154,
    borderRadius: 12,
  },
  cardBody: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#173153',
    marginRight: 8,
  },
  cardAirport: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5f697d',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: -8,
    flexWrap: 'wrap',
  },
  cardRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  cardRowItemText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
    color: '#5f697d',
  },
  cardPrice: {
    fontSize: 13,
    fontWeight: '500',
    color: '#5f697d',
  },
  cardPriceValue: {
    fontSize: 21,
    fontWeight: '700',
    color: '#173153',
  },
  cardPriceCurrency: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6f61c4',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    backgroundColor: '#173153',
    borderColor: '#173153',
  },
  btnText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#fff',
  },
});
