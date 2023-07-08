import React from "react";
import { AppRegistry } from "react-native";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import Cards from "./screens/Cards";

// Initialize Apollo Client
const client = new ApolloClient({
  uri: "https://beta.pokeapi.co/graphql/v1beta",
  cache: new InMemoryCache,
});

export default App = () => (
  <ApolloProvider client={client}>
    <Cards />
  </ApolloProvider>
);
