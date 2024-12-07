import { useTheme } from "@/hooks/useTheme";
import { useRouter } from "expo-router";
import { Dimensions, View } from "react-native";
import { Appbar, ActivityIndicator, Chip, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useReader, Reader } from "@epubjs-react-native/core";
import { useFileSystem } from "@epubjs-react-native/expo-file-system";
import { getDocumentAsync } from "expo-document-picker";
import { useEffect, useState } from "react";
import { Directory, File, Paths } from "expo-file-system/next";
import { unpackEPUBWithJSZip } from "@/lib/epub";
import { BookInformation } from "@/lib/types";
import { Image } from "react-native";

export default function BookModal() {
  const [bookUri, setBookUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookInformation, setBookInformation] =
    useState<BookInformation | null>(null);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const destination = new Directory(Paths.cache, "epubs");

  const handleSelectBook = async () => {
    destination.create();
    setBookInformation(null);
    const book = await getDocumentAsync();
    if (!book.canceled) {
      setLoading(true);
      book.assets.map(async (asset) => {
        if (asset.mimeType?.includes("epub")) {
          setBookUri(asset.uri);
          const bookInformation = await unpackEPUBWithJSZip(asset.uri);
          bookInformation && setBookInformation(bookInformation);
        }
        setLoading(false);
      });
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <Appbar.Header
        style={{
          backgroundColor: colors.background,
        }}
      >
        <Appbar.Action
          icon={"arrow-down"}
          onPress={() => {
            router.back();
          }}
        />
        <Appbar.Content title="New Book" />
        <Appbar.Action
          icon={bookInformation ? "restart" : "plus"}
          onPress={() => {
            handleSelectBook();
          }}
        />
      </Appbar.Header>
      <View
        style={{
          flex: 1,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          backgroundColor: colors.surface,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        {bookInformation && (
          <View
            style={{
              paddingRight: 14,
              gap: 4,
              flexDirection: "row",
              backgroundColor: colors.surfaceDim,
              borderTopRightRadius: 24,
              borderBottomRightRadius: 24,
            }}
          >
            <Image
              source={{
                uri: `data:image/jpeg;base64,${bookInformation.image}`,
              }}
              style={{
                width: 100,
                aspectRatio: 2 / 3,
                objectFit: "contain",
              }}
            />

            <View
              style={{
                paddingVertical: 4,
              }}
            >
              <Text
                variant="titleLarge"
                style={{
                  textAlign: "left",
                  width: Dimensions.get("window").width * 0.5,
                  flexWrap: "wrap",
                }}
              >
                {bookInformation.title}
              </Text>
              <Text
                variant="bodySmall"
                style={{
                  width: Dimensions.get("window").width * 0.66,
                  flex: 1,
                }}
              >
                {bookInformation.description.slice(0, 200) ||
                  "No Description Provided"}
                ...
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "flex-end",

                  gap: 4,
                }}
              >
                {bookInformation.creators.map((c, idx) => {
                  return (
                    <Chip
                      style={{
                        backgroundColor: colors.tertiaryContainer,
                      }}
                      textStyle={{
                        color: colors.onTertiaryContainer,
                      }}
                      key={idx}
                    >
                      {c}
                    </Chip>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {loading && (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActivityIndicator
              animating
              size={"large"}
              color={colors.onBackground}
            />
          </View>
        )}
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            overflow: "hidden",
            borderRadius: 24,
          }}
        ></View>
      </View>
    </View>
  );
}
