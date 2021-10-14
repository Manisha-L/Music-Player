import { StatusBar } from "expo-status-bar";
import React, { useRef, useEffect, useState } from "react";
import { Audio, Video } from "expo-av";

import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Animated,
} from "react-native";

import songs from "./data";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const clonedPlaybackInstance = new Audio.Sound();
const App = () => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const songSlider = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackInstance, setPlaybackInstance] = useState(null);
  const [volume, setVolume] = useState(1.0);
  const [isBuffering, setIsBuffering] = useState(true);
  // console.log("printttt", songs[currentIndex].url);
  const onPlaybackStatusUpdate = (status) => {
    setIsBuffering(status.isBuffering);
  };
  const loadAudio = async () => {
    try {
      const src = songs[currentIndex].url;

      const status = {
        shouldPlay: isPlaying,
        volume: volume,
      };

      clonedPlaybackInstance.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      await clonedPlaybackInstance.loadAsync(src, status);
      await clonedPlaybackInstance.playAsync();
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    (async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
          playsInSilentModeIOS: true,
          interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
          shouldDuckAndroid: true,
          staysActiveInBackground: true,
        });
      } catch (e) {
        console.log(e);
      }
    })();
  }, []);

  useEffect(() => {
    scrollX.addListener(({ value }) => {
      const index = Math.round(value / width);
      setCurrentIndex(index);
    });
    return () => {
      scrollX.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    (async () => {
      const s = await clonedPlaybackInstance.getStatusAsync();
      if (s.isLoaded) {
        await clonedPlaybackInstance.unloadAsync();
        await loadAudio();
        setIsPlaying(true);
      }
    })();
  }, [currentIndex]);

  const handlePlayPause = async () => {
    const s = await clonedPlaybackInstance.getStatusAsync();

    if (s.isPlaying) {
      await clonedPlaybackInstance.pauseAsync();
      setIsPlaying(false);
      return;
    } else if (s.isLoaded) {
      await clonedPlaybackInstance.playAsync();
      setIsPlaying(true);
      return;
    }
    await loadAudio();
    setIsPlaying(true);
  };

  const handlePreviousTrack = () => {
    setCurrentIndex(currentIndex - 1);
    songSlider.current.scrollToOffset({
      offset: (currentIndex - 1) * width,
    });
    setCurrentIndex(currentIndex);
  };

  const handleNextTrack = () => {
    setCurrentIndex(currentIndex + 1);
    songSlider.current.scrollToOffset({
      offset: (currentIndex + 1) * width,
    });
    setCurrentIndex(currentIndex);
  };

  const renderSongs = ({ item }) => {
    return (
      <Animated.View style={styles.imgWrapper}>
        <Image source={item.image} style={styles.img}></Image>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <StatusBar style="auto" />
        <View style={styles.musicWrapper}>
          <FontAwesome name="music" size={35} color="deeppink" />
          <Text style={styles.music}>Music</Text>
        </View>

        <Animated.FlatList
          ref={songSlider}
          data={songs}
          renderItem={renderSongs}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
        />

        <View style={styles.bottomContainer}>
          <View style={styles.details}>
            <Text
              style={{ color: "deeppink", fontSize: 25, fontWeight: "bold" }}
            >
              {songs[currentIndex].title}
            </Text>
            <Text style={{ color: "orangered" }}>
              {songs[currentIndex].artist}
            </Text>
          </View>

          <View
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <View style={styles.musicControls}>
              <TouchableOpacity onPress={() => handlePreviousTrack()}>
                <Ionicons
                  name="md-play-skip-back"
                  size={55}
                  color="darkorange"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  handlePlayPause();
                }}
              >
                {isPlaying ? (
                  <Ionicons
                    name="md-pause-circle"
                    size={75}
                    color="darkorange"
                  />
                ) : (
                  <Ionicons
                    name="md-play-circle"
                    size={75}
                    color="darkorange"
                  />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  handleNextTrack();
                }}
              >
                <Ionicons
                  name="md-play-skip-forward"
                  size={55}
                  color="darkorange"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  musicWrapper: {
    justifyContent: "center",
    marginTop: 80,
    flexDirection: "row",
  },
  music: {
    color: "orangered",
    fontSize: 35,
    marginHorizontal: 5,
  },
  imgWrapper: {
    marginTop: 20,
    width: width,
    height: 340,
  },

  img: {
    borderRadius: 20,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  bottomContainer: {
    marginBottom: 50,
    height: 200,
  },
  details: {
    alignItems: "center",
    marginBottom: 30,
  },

  musicControls: {
    width: 300,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
});
export default App;
