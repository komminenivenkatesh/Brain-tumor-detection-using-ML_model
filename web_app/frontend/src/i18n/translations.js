// Simple i18n translations
export const translations = {
  en: {
    header: {
      title: '🧠 Brain Tumor Detection',
      subtitle: 'AI-Powered Medical Imaging Analysis',
      welcome: 'Welcome',
      signOut: 'Sign Out',
      lightMode: 'Light Mode',
      darkMode: 'Dark Mode'
    },
    tabs: {
      upload: '📤 Upload & Analyze',
      results: '📊 Results',
      history: '📜 History',
      profile: '👤 Patient Profile'
    },
    upload: {
      title: 'Select Brain MRI Images',
      subtitle: 'Upload multiple images for batch analysis',
      dragDrop: 'Drag and drop your images here',
      orClick: 'or click to browse',
      supported: 'Supported: JPG, PNG',
      selected: 'file(s) selected',
      uploading: 'Analyzing',
      analyze: 'Analyze Image',
      analyzeMultiple: 'Analyze {count} Images',
      errors: {
        selectImage: 'Please select an image first',
        imageOnly: 'Please upload an image file',
        selectFiles: 'Please select at least one image',
        failed: 'Analysis failed. Please try again.'
      },
      info: {
        title: 'Important:',
        item1: 'Upload clear, high-quality brain MRI images',
        item2: 'Supported formats: JPEG, PNG',
        item3: 'Image size should be between 64x64 and 512x512 pixels',
        item4: 'Analysis takes 2-5 seconds per image',
        item5: 'Batch analysis: Upload multiple images at once'
      }
    },
    results: {
      title: 'Analysis Results',
      noSelection: 'No analysis selected. Upload an image first.',
      tumorDetected: '⚠️ TUMOR DETECTED',
      normal: '✅ NORMAL',
      classification: 'Classification:',
      confidence: 'Confidence Level:',
      probability: 'Probability',
      riskLevel: 'Risk Level',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      segmentation: 'Tumor Segmentation',
      download: '📥 Download Report (PDF)',
      generating: '⏳ Generating...',
      share: '📤 Share with Doctor',
      disclaimer: '⚕️ Medical Disclaimer',
      disclaimerText: 'This analysis is AI-assisted and should not be used as a sole diagnostic tool. Always consult with a qualified medical professional for accurate diagnosis and treatment.'
    },
    profile: {
      title: '👤 Patient Profile',
      edit: '✏️ Edit',
      cancel: '❌ Cancel',
      save: '💾 Save Profile',
      saving: '💾 Saving...',
      fields: {
        fullName: 'Full Name:',
        email: 'Email:',
        age: 'Age:',
        gender: 'Gender:',
        contact: 'Contact Number:',
        medicalHistory: 'Medical History:',
        medications: 'Current Medications:',
        allergies: 'Allergies:'
      },
      notProvided: 'Not provided',
      messages: {
        success: 'Profile updated successfully!',
        error: 'Failed to update profile'
      }
    }
  },
  es: {
    header: {
      title: '🧠 Detección de Tumor Cerebral',
      subtitle: 'Análisis de Imágenes Médicas Impulsado por IA',
      welcome: 'Bienvenido',
      signOut: 'Cerrar sesión',
      lightMode: 'Modo claro',
      darkMode: 'Modo oscuro'
    },
    tabs: {
      upload: '📤 Cargar y analizar',
      results: '📊 Resultados',
      history: '📜 Historial',
      profile: '👤 Perfil del paciente'
    },
    upload: {
      title: 'Seleccionar imágenes de resonancia magnética cerebral',
      subtitle: 'Cargue múltiples imágenes para análisis por lotes',
      dragDrop: 'Arrastra y suelta tus imágenes aquí',
      orClick: 'o haz clic para examinar',
      supported: 'Compatible: JPG, PNG',
      selected: 'archivo(s) seleccionado(s)',
      uploading: 'Analizando',
      analyze: 'Analizar imagen',
      analyzeMultiple: 'Analizar {count} imágenes',
      errors: {
        selectImage: 'Por favor, selecciona una imagen primero',
        imageOnly: 'Por favor, cargue un archivo de imagen',
        selectFiles: 'Por favor, selecciona al menos una imagen',
        failed: 'El análisis falló. Por favor, inténtelo de nuevo.'
      },
      info: {
        title: 'Importante:',
        item1: 'Cargue imágenes MRI cerebrales claras y de alta calidad',
        item2: 'Formatos compatibles: JPEG, PNG',
        item3: 'El tamaño de la imagen debe estar entre 64x64 y 512x512 píxeles',
        item4: 'El análisis toma 2-5 segundos por imagen',
        item5: 'Análisis por lotes: Carga múltiples imágenes a la vez'
      }
    },
    results: {
      title: 'Resultados del análisis',
      noSelection: 'Sin análisis seleccionado. Cargue una imagen primero.',
      tumorDetected: '⚠️ TUMOR DETECTADO',
      normal: '✅ NORMAL',
      classification: 'Clasificación:',
      confidence: 'Nivel de confianza:',
      probability: 'Probabilidad',
      riskLevel: 'Nivel de riesgo',
      high: 'Alto',
      medium: 'Medio',
      low: 'Bajo',
      segmentation: 'Segmentación del tumor',
      download: '📥 Descargar informe (PDF)',
      generating: '⏳ Generando...',
      share: '📤 Compartir con el médico',
      disclaimer: '⚕️ Descargo de responsabilidad médica',
      disclaimerText: 'Este análisis es asistido por IA y no debe utilizarse como herramienta de diagnóstico única. Siempre consulte con un profesional médico calificado para un diagnóstico y tratamiento precisos.'
    },
    profile: {
      title: '👤 Perfil del paciente',
      edit: '✏️ Editar',
      cancel: '❌ Cancelar',
      save: '💾 Guardar perfil',
      saving: '💾 Guardando...',
      fields: {
        fullName: 'Nombre completo:',
        email: 'Correo electrónico:',
        age: 'Edad:',
        gender: 'Género:',
        contact: 'Número de contacto:',
        medicalHistory: 'Historial médico:',
        medications: 'Medicamentos actuales:',
        allergies: 'Alergias:'
      },
      notProvided: 'No proporcionado',
      messages: {
        success: '¡Perfil actualizado exitosamente!',
        error: 'Error al actualizar el perfil'
      }
    }
  }
}

export const useTranslation = (language = 'en') => {
  return translations[language] || translations['en']
}
