import styles from './MuseoStyles';

import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    ActivityIndicator, 
    Alert,
    SafeAreaView // Usar SafeAreaView para mejor compatibilidad en iOS/Android
} from 'react-native';

// 🚨 Asegúrate de que la instancia de Firestore esté inicializada y disponible
// La importación de getFirestore, doc, getDoc debe venir del SDK de Firebase Client (no firebase-admin)
import { getFirestore, doc, getDoc } from 'firebase/firestore'; 

// Importa los estilos
import styles from './MuseoStyles';

// ASUMPCIÓN: La instancia de Firestore se obtiene aquí
// Podrías necesitar adaptarlo a cómo exportas 'db' en tu proyecto.
const db = getFirestore(); 
const COLECCION_MUSEO = "datos_museo";


// Componente para renderizar el contenido de una sección
const SectionContent = ({ content }) => (
    <View style={styles.sectionContent}>
        {/* Descripción General del Tema */}
        <Text style={styles.sectionDescription}>{content.descripcion}</Text>
        
        {/* Datos Curiosos */}
        <Text style={styles.subtitle}>✨ Datos Curiosos</Text>
        <View style={styles.listContainer}>
            {content.datos_curiosos.map((dato, index) => (
                <View key={index} style={styles.listItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.itemText}>{dato}</Text>
                </View>
            ))}
        </View>

        {/* Ejemplos Clave */}
        <Text style={styles.subtitle}>💡 Ejemplos Clave del Juego</Text>
        <View style={styles.listContainer}>
            {content.ejemplos_clave.map((ejemplo, index) => (
                <View key={index} style={styles.listItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.itemText}>{ejemplo}</Text>
                </View>
            ))}
        </View>
    </View>
);


// Componente Principal
const MuseoScreen = ({ selectedState = 'Estado de México' }) => { 
    const [museumData, setMuseumData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState(null); 

    useEffect(() => {
        const fetchMuseumData = async () => {
            setLoading(true);
            setMuseumData(null); 

            try {
                // Referencia al documento (ID: "Estado de México" o "Morelos")
                const docRef = doc(db, COLECCION_MUSEO, selectedState);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setMuseumData(data);
                    
                    // Si el documento tiene secciones, establece la primera como activa
                    if (data && data.secciones && data.secciones.length > 0) {
                        setActiveSection(data.secciones[0].tema);
                    }
                } else {
                    Alert.alert("Error", `No se encontraron datos del museo para ${selectedState}.`);
                }
            } catch (error) {
                console.error("Error al cargar datos del museo desde Firestore:", error);
                Alert.alert("Error de Conexión", "No se pudieron cargar los datos del museo. Verifique su conexión.");
            } finally {
                setLoading(false);
            }
        };

        fetchMuseumData();
    }, [selectedState]);

    // --- Renderizado de Carga y Errores ---
    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#007ACC" />
                <Text style={styles.loadingText}>Cargando experiencia del museo...</Text>
            </View>
        );
    }

    if (!museumData) {
        return (
            <View style={[styles.container, styles.center]}>
                <Text style={styles.title}>Museo no disponible 🙁</Text>
                <Text style={styles.introduction}>Verifique la configuración o la conexión a Firebase.</Text>
            </View>
        );
    }
    
    // Encuentra el contenido de la pestaña activa
    const activeContent = museumData.secciones.find(sec => sec.tema === activeSection);
    
    // --- Renderizado Principal ---
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🏛️ Museo de {museumData.estado}</Text>
                <Text style={styles.introduction}>{museumData.introduccion}</Text>
            </View>
            
            {/* Pestañas de Navegación (Tabs) */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
                {museumData.secciones.map((section) => (
                    <TouchableOpacity
                        key={section.tema}
                        style={[
                            styles.tab,
                            activeSection === section.tema && styles.activeTab 
                        ]}
                        onPress={() => setActiveSection(section.tema)}
                    >
                        <Text style={[
                            styles.tabText,
                            activeSection === section.tema && styles.activeTabText
                        ]}>
                            {section.tema}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Contenido de la Sección Activa */}
            <ScrollView style={styles.contentContainer} contentContainerStyle={styles.contentPadding}>
                {activeContent ? (
                    <SectionContent content={activeContent} />
                ) : (
                    <Text style={styles.sectionDescription}>Seleccione una sección para empezar.</Text>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default MuseoScreen;