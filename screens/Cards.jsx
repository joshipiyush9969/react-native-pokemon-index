import React, { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useLazyQuery } from "@apollo/client";
import { gql } from "@apollo/client";

import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Image,
  Animated,
  StatusBar,
  useWindowDimensions,
  Pressable,
  TextInput,
  Dimensions,
  Linking,
} from "react-native";
import getBackgroundImage from "../helper/getBackground";
import StatsBar from "../components/StatusBar";
import TintedImage from "../components/TintedImage";
import { typeImageMap } from "../helper/getImage";
import Line from "../components/Line";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableOpacity, Modal } from "react-native";
import { Entypo } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import pokemon from "pokemon";
import { Alert } from "react-native";
import { GET_POKEMONS } from "../graphql/pokemongql";

export default () => {
  const scrollX = React.useRef(new Animated.Value(0)).current;
  const { width, height } = useWindowDimensions();
  const [search, setSearch] = useState("");
  const flatListRef = useRef(null);

  const [isLoading, setLoading] = useState(false);

  const IMAGE_WIDTH = React.useMemo(() => width * 0.7, [width]);

  const imageH = React.useMemo(() => height * 0.3, [IMAGE_WIDTH]);

  const [apperror, setAppError] = useState();

  useEffect(() => {
    if (apperror) {
      return Alert.alert("", apperror, [
        {
          text: "Okay",
          onPress: () => {
            setAppError();
          },
        },
      ]);
    }
  }, [apperror]);

  const { loading, data, fetchMore, error } = useQuery(GET_POKEMONS, {
    variables: { limit: 10, offset: 0 },
  });

  if (error) {
    setAppError("Fetching Failed");
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  const handleLoadMore = () => {
    setLoading(true);
    try {
      if (!loading && data) {
        setLoading(true);
        const totalCount = data.pokemon_v2_pokemon.at(-1).id;
        fetchMore({
          variables: { limit: 10, offset: totalCount },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) return prev;

            let updatedData = [
              ...prev.pokemon_v2_pokemon,
              ...fetchMoreResult.pokemon_v2_pokemon,
            ];

            return {
              pokemon_v2_pokemon: updatedData,
            };
          },
        });
        setLoading(false);
      }
    } catch (err) {
      setAppError("Unable to load more, something went wrong");
    }
    setLoading(false);
  };

  const searchById = async (id) => {
    try {
      if (!loading && data) {
        await fetchMore({
          variables: { limit: 10, offset: id - 1 },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult || id > 1010) return prev;

            if (fetchMoreResult.pokemon_v2_pokemon.length !== 0) {
              let updatedData = [...fetchMoreResult.pokemon_v2_pokemon];

              return {
                pokemon_v2_pokemon: updatedData,
              };
            } else {
              setAppError("Not able to find your pokemon");
            }
          },
        });
        flatListRef.current?.scrollToIndex({ index: 0, animated: true });
      }
    } catch (err) {
      setAppError("Unable to fetch results from search");
    }
  };

  const searchPokemon = async () => {
    try {
      setLoading(true);
      if (search.trim().length !== 0) {
        const isNumeric = /^\d+$/.test(search);
        if (isNumeric) {
          searchById(search);
        } else {
          const pokemonId = pokemon.getId(capitalizeFirstLetter(search));

          searchById(pokemonId);
        }
      } else {
        setAppError("Please provide a valid input");
      }
    } catch (err) {
      setAppError("Unable to fetch results from search");
    }
    setLoading(false);
    setSearch("");
  };

  const renderItem = useCallback(
    ({ item }) => {
      const checkOut = () => {
        try {
          const word = item.name;
          const capitalized = word.charAt(0).toUpperCase() + word.slice(1);

          // Replace hyphens with underscores
          const underscored = capitalized.replace(/-/g, "_");

          // Append (Pokémon)
          const result = underscored + "_(Pokémon)";
          Linking.openURL(`https://bulbapedia.bulbagarden.net/wiki/${result}`);
        } catch (err) {
          setAppError("Something went wrong");
        }
      };
      return (
        <View
          style={{
            width: width,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000000",
            shadowOpacity: 0.5,
            shadowOffset: {
              width: 0,
              height: 0,
            },
            shadowRadius: 20,
            marginTop: "10%",
          }}
        >
          <Image
            source={{
              uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.id}.png`,
            }}
            style={{
              height: imageH,
              width: IMAGE_WIDTH,
              resizeMode: "cover",
            }}
          />
          <View
            style={{
              width: "90%",
              flex: 1,
              opacity: 0.8,
              backgroundColor: "rgba(255,255,255,0.4)",
              padding: "5%",
              borderTopRightRadius: 16,
              borderTopLeftRadius: 16,
            }}
          >
            <Text
              style={[
                styles.pokemonName,
                {
                  alignSelf: "center",
                  fontSize: 27,
                  letterSpacing: 1,
                  marginTop: "2.5%",
                },
              ]}
            >
              {capitalizeFirstLetter(item.name)} #{item.id}
            </Text>
            <Line />
            <View
              style={{
                width: 50,
                alignItems: "center",
                justifyContent: "center",
                alignSelf: "center",
                marginBottom: "5%",
                flexDirection: "row",
              }}
            >
              {item.pokemon_v2_pokemontypes?.map((t) => {
                return (
                  <TintedImage
                    key={"t" + t.pokemon_v2_type.name}
                    imagePath={
                      typeImageMap[t.pokemon_v2_type.name.toLowerCase()].image
                    }
                    tintStyle={
                      typeImageMap[t.pokemon_v2_type.name.toLowerCase()].color
                    }
                    imageSize={{ width: 22, height: 22 }}
                    tintRadius={100}
                  />
                );
              })}
            </View>
            <View
              style={{
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                marginBottom: "5%",
              }}
            >
              <Text
                style={[
                  styles.pokemonName,
                  { fontSize: 25, fontWeight: "bold" },
                ]}
              >
                Abilities
              </Text>
              <Line />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                {item?.pokemon_v2_pokemonabilities.map((i, index) => {
                  return (
                    <Text
                      key={"ab" + index}
                      style={[
                        styles.pokemonName,
                        {
                          fontSize: 18,
                          fontWeight: "normal",
                        },
                      ]}
                    >
                      {capitalizeFirstLetter(i.pokemon_v2_ability.name)}
                    </Text>
                  );
                })}
              </View>
            </View>
            <View style={{ marginBottom: "2.5%" }}>
              <StatsBar
                stats={item.pokemon_v2_pokemonstats}
                capitalizeFirstLetter={capitalizeFirstLetter}
              />
            </View>
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View style={{ width: "100%" }}>
                <Text
                  style={[
                    styles.pokemonName,
                    { fontSize: 25, fontWeight: "bold", alignSelf: "center" },
                  ]}
                >
                  Moves
                </Text>
                <TouchableOpacity
                  onPress={checkOut}
                  style={{
                    position: "absolute",
                    padding: "2.5%",
                    alignItems: "center",
                    justifyContent: "center",
                    right: 0,
                    backgroundColor: "#e53d36",
                    borderRadius: 100,
                    flexDirection: "row",
                  }}
                >
                  <MaterialCommunityIcons
                    name="pokeball"
                    size={22}
                    color="#ffffff"
                  />
                  <Entypo
                    name="chevron-small-right"
                    size={25}
                    color="#ffffff"
                  />
                </TouchableOpacity>
              </View>

              <Line />
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexDirection: "row",
                  marginBottom: "25%",
                  width: "100%",
                }}
              >
                {item?.pokemon_v2_pokemonmoves.map((i, index) => {
                  return (
                    <View
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        alignSelf: "center",
                      }}
                    >
                      <TintedImage
                        key={"t" + i.pokemon_v2_move.pokemon_v2_type.name}
                        imagePath={
                          typeImageMap[
                            i.pokemon_v2_move.pokemon_v2_type.name.toLowerCase()
                          ].image
                        }
                        tintStyle={
                          typeImageMap[
                            i.pokemon_v2_move.pokemon_v2_type.name.toLowerCase()
                          ].color
                        }
                        imageSize={{ width: 22, height: 22 }}
                        tintRadius={10}
                      />
                      <Text
                        style={[
                          styles.pokemonName,
                          {
                            fontSize: 12,
                            fontWeight: "normal",
                            alignSelf: "center",
                          },
                        ]}
                      >
                        {capitalizeFirstLetter(i.pokemon_v2_move.name)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      );
    },
    [data]
  );

  if (loading && !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <>
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <TextInput
          style={styles.input}
          value={search}
          onSubmitEditing={searchPokemon}
          onChangeText={setSearch}
          placeholder="Search by name or #id"
        />
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle={"dark-content"}
        />

        <View
          style={[StyleSheet.absoluteFillObject, { opacity: 0.4 }]}
          pointerEvents="none"
        >
          {data?.pokemon_v2_pokemon.map((pokemon, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0, 1, 0],
            });
            return (
              <Animated.Image
                key={`image${pokemon.id}`}
                source={{
                  uri: getBackgroundImage(
                    pokemon?.pokemon_v2_pokemontypes[0]?.pokemon_v2_type?.name
                  ),
                }}
                style={[StyleSheet.absoluteFillObject, { opacity: opacity }]}
                blurRadius={5}
              />
            );
          })}
        </View>
        {!loading && (
          <>
            {isLoading && (
              <ActivityIndicator
                style={{ top: "25%", left: "45%", position: "absolute" }}
                size="large"
                color="#cdcdcdcd"
              />
            )}
            <Animated.FlatList
              disableVirtualization={true}
              disableIntervalMomentum={true}
              initialNumToRender={10}
              removeClippedSubviews={true}
              horizontal
              pagingEnabled
              snapToInterval={width}
              ref={flatListRef}
              decelerationRate="normal"
              showsHorizontalScrollIndicator={false}
              data={data?.pokemon_v2_pokemon}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: true }
              )}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              onEndReached={() => handleLoadMore("end")}
              onEndReachedThreshold={1}
            />
          </>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },
  pokemonName: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "bold",
  },
  centeredView: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingTop: Dimensions.get("window").height,
    position: "absolute",
    bottom: 0,
    alignSelf: "center",
  },
  modalView: {
    backgroundColor: "#ffffff",
    borderBottomColor: "#ffffff",
    padding: 35,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    width: "100%",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    height: 40,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 10,
    width: "85%",
    borderRadius: 10,
    fontSize: 17,
    alignSelf: "center",
    position: "absolute",
    top: "5%",
    zIndex: 1,
    color: "#cdcdcd",
  },
});
