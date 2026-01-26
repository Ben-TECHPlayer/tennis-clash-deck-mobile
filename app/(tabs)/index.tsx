import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// On récupère la largeur de l'écran pour que chaque slide prenne toute la place
const { width } = Dimensions.get("window");

// Données des slides
const SLIDES = [
  // {
  //   id: 1,
  //   type: "kyrgios",
  //   title: "KYRGIOS IS BACK!!!",
  //   subtitle: "GO TO PLAY WITH HIM!!!",
  //   cta: "Let's go!!!",
  //   link: "/card", // Lien simplifié pour la démo
  //   bgColor: "#1E90FF", // bg-blue
  // },
  {
    id: 1,
    type: "legends",
    title: "LEGENDS ARE HERE!!!",
    subtitle: "MEET OSAKA & MORE...",
    cta: "Go to Card Database",
    link: "/card",
    bgImage: require("../../assets/images/legends.png"),
    textColor: "#FFF",
  },
  {
    id: 2,
    type: "tournament",
    title: "AUSTRALIAN OPEN",
    subtitle: "JANUARY 22-26",
    cta: "Attend tournament",
    link: "/games",
    bgImage: require("../../assets/images/ao-open.png"),
  },
  {
    id: 3,
    type: "champions",
    title: "The champions are here!",
    subtitle: "GO TO PLAY",
    cta: "Go to it!!!",
    link: "/lineup",
    bgImage: require("../../assets/images/cover.jpg"),
  },
];

export default function HomeScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  // Changement automatique de slide (Auto-play)
  useEffect(() => {
    const timer = setInterval(() => {
      let nextSlide = currentSlide + 1;
      if (nextSlide >= SLIDES.length) {
        nextSlide = 0;
      }
      // On fait défiler la ScrollView vers le prochain slide
      scrollViewRef.current?.scrollTo({ x: nextSlide * width, animated: true });
      setCurrentSlide(nextSlide);
    }, 5000); // 5 secondes

    return () => clearInterval(timer);
  }, [currentSlide]);

  // Fonction appelée quand l'utilisateur fait glisser (scroll) manuellement
  const onScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentSlide(slideIndex);
  };

  const handleNavigation = (path: string) => {
    // Si c'est un lien interne, on utilise router.push
    // Si la route n'existe pas encore, attention aux erreurs !
    try {
      // Pour l'instant, redirigeons vers les onglets existants
      if (path.includes("card")) router.push("/(tabs)/lineup" as any);
      else if (path.includes("games")) router.push("/(tabs)/clubs" as any);
      else router.push("/(tabs)/lineup" as any);
    } catch (e) {
      console.warn("Route non trouvée", path);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* --- CARROUSEL --- */}
        <View style={styles.carouselContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled // Permet de "snapper" (coller) slide par slide
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16} // Fluidité du scroll
          >
            {SLIDES.map((slide) => (
              <ImageBackground
                key={slide.id}
                source={slide.bgImage}
                style={styles.slide}
                resizeMode="contain"
              >
                {/* 2. SLIDE LEGENDS */}
                {slide.type === "legends" && (
                  <View style={styles.slideContent}>
                    <Text style={[styles.title, { color: "#FFF" }]}>
                      {slide.title}
                    </Text>
                    <Text style={[styles.subtitle, { color: "#FFF" }]}>
                      {slide.subtitle}
                    </Text>
                    <TouchableOpacity
                      style={styles.buttonSecondary}
                      onPress={() => handleNavigation(slide.link)}
                    >
                      <Text style={styles.buttonTextSecondary}>
                        {slide.cta}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* 3. SLIDE GRAND TOUR */}
                {slide.type === "tournament" && (
                  <View style={styles.slideContent}>
                    <Text style={styles.aoLogo}>AO</Text>
                    <Text style={styles.title}>{slide.title}</Text>
                    <Text style={styles.subtitle}>📅 {slide.subtitle}</Text>
                    <TouchableOpacity
                      style={styles.buttonAccent}
                      onPress={() => handleNavigation(slide.link)}
                    >
                      <Text style={styles.buttonText}>{slide.cta}</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* 4. SLIDE CHAMPIONS */}
                {slide.type === "champions" && (
                  <View style={styles.slideContent}>
                    <Text style={styles.title}>{slide.title}</Text>
                    <Text style={styles.subtitle}>{slide.subtitle}</Text>
                    <TouchableOpacity
                      style={styles.buttonPrimary}
                      onPress={() => handleNavigation(slide.link)}
                    >
                      <Text style={styles.buttonText}>{slide.cta}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ImageBackground>
            ))}
          </ScrollView>

          {/* Points de navigation (Dots) */}
          <View style={styles.dotsContainer}>
            {SLIDES.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, currentSlide === index && styles.dotActive]}
              />
            ))}
          </View>
        </View>

        {/* Section Bonus en dessous */}
        <View style={styles.quickAccess}>
          <Text style={styles.quickText}>Welcome to Tennis Clash!</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "azure" },
  carouselContainer: { height: 400 }, // Hauteur du slider
  slide: {
    width: width, // Le slide prend toute la largeur
    height: 400,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  slideContent: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },

  // Textes
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "white",
    textAlign: "center",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 20,
    fontWeight: "bold",
  },

  // Boutons
  buttonPrimary: {
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonSecondary: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonAccent: {
    backgroundColor: "#00C853", // Vert
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonText: { color: "#000", fontWeight: "bold", fontSize: 16 },
  buttonTextSecondary: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  // Éléments décoratifs
  badge: {
    backgroundColor: "red",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginBottom: 10,
  },
  badgeText: { color: "white", fontWeight: "bold", fontSize: 12 },
  imagePlaceholder: {
    width: 150,
    height: 150,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 75,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  aoLogo: {
    fontSize: 80,
    fontWeight: "bold",
    color: "#00C853",
    opacity: 0.3,
    position: "absolute",
    top: -50,
  },

  // Cartes décoratives (Legends)
  cardsRow: {
    flexDirection: "row",
    height: 100,
    alignItems: "center",
    marginBottom: 20,
  },
  miniCard: {
    width: 60,
    height: 90,
    backgroundColor: "#333",
    borderRadius: 5,
    marginHorizontal: -10,
    borderWidth: 2,
    borderColor: "white",
  },

  // Pagination (Dots)
  dotsContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 20,
    width: "100%",
    justifyContent: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.5)",
    marginHorizontal: 5,
  },
  dotActive: {
    backgroundColor: "white",
    width: 20, // Le point actif est plus large
  },

  // Footer
  quickAccess: { padding: 20, alignItems: "center" },
  quickText: { fontSize: 16, color: "#666", fontStyle: "italic" },
});
