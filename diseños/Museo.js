import {
    StyleSheet,
    Dimensions
}

from 'react-native';

const styles=StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7F7', // Fondo gris muy claro para contraste
        paddingTop: 10,
    }

    ,
    // Estilo para centrar el contenido (usado en carga/errores)
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    }

    ,
    // Contenedor para el título e introducción
    header: {
        paddingHorizontal: 15,
    }

    ,

    // --- Tipografía Principal ---
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333333', // Gris oscuro
        marginBottom: 5,
        textAlign: 'center',
    }

    ,
    introduction: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 15,
        paddingHorizontal: 10,
    }

    ,
    loadingText: {
        marginTop: 10,
        color: '#666',
    }

    ,

    // --- Pestañas de Navegación (Tabs) ---
    tabContainer: {
        flexDirection: 'row',
        maxHeight: 45, // Altura limitada para el scroll horizontal
        marginBottom: 15,
        paddingHorizontal: 10,
    }

    ,
    tab: {
        paddingHorizontal: 18,
        paddingVertical: 8,
        marginHorizontal: 5,
        backgroundColor: '#FFFFFF',
        borderRadius: 20, // Pestañas redondeadas tipo "píldora"
        borderWidth: 1,
        borderColor: '#EEEEEE',
    }

    ,
    activeTab: {
        backgroundColor: '#007ACC', // Azul Primario para el estado activo

        borderColor: '#007ACC',
        shadowColor: '#000',
        shadowOffset: {
            width: 0, height: 2
        }

        ,
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 6,
    }

    ,
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666666',
    }

    ,
    activeTabText: {
        color: '#FFFFFF', // Texto blanco en la pestaña activa
        fontWeight: 'bold',
    }

    ,

    // --- Contenedor de Contenido Activo (La "Vitrina") ---
    contentContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF', // Fondo blanco para que el contenido resalte

        borderRadius: 10,
        marginHorizontal: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0, height: 1
        }

        ,
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    }

    ,
    contentPadding: {
        padding: 15, // Espaciado interno para el contenido
    }

    ,

    // --- Descripción del Tema (El Bloque de Texto Principal) ---
    sectionDescription: {
        fontSize: 15,
        lineHeight: 22,
        color: '#444444',
        marginBottom: 20,
        borderLeftWidth: 4, // Barra lateral gruesa (Efecto "placa de museo")
        borderLeftColor: '#F0AD4E', // Color Ámbar/Naranja para contraste
        paddingLeft: 10,
        fontStyle: 'italic', // Da un toque de curaduría
    }

    ,

    // --- Subtítulos de Secciones (Datos Curiosos / Ejemplos Clave) ---
    subtitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#007ACC',
        marginTop: 15,
        marginBottom: 10,
        borderBottomWidth: 1, // Separador sutil
        borderBottomColor: '#EEEEEE',
        paddingBottom: 5,
    }

    ,

    // --- Listas de Datos y Ejemplos ---
    listContainer: {
        marginBottom: 20,
    }

    ,
    listItem: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'flex-start',
    }

    ,
    bullet: {
        fontSize: 16,
        color: '#007ACC', // Viñetas del color principal
        marginRight: 8,
        fontWeight: '900',
    }

    ,
    itemText: {
        flex: 1,
        fontSize: 14,
        color: '#555555',
        lineHeight: 20, // Mejora la legibilidad
    }
});

export default styles;