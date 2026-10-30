import type { MessageKey } from './en';

/**
 * Spanish translations. `Record<MessageKey, string>` makes missing (or extra)
 * keys a compile-time error when English gains a message.
 */
export const es: Record<MessageKey, string> = {
  // Language switcher
  'language.label': 'Idioma',
  'language.auto': 'Auto',

  // Header
  'header.samples': 'Ejemplos',
  'header.samples.open': 'Abrir ejemplos',
  'header.samples.close': 'Cerrar ejemplos',
  'header.newFile': 'Nuevo archivo',
  'header.autorun': 'Autoejecutar',
  'header.run': 'EJECUTAR',
  'header.rerun': 'REEJECUTAR',
  'header.runAria': 'Ejecutar circuito',
  'header.rerunAria': 'Reejecutar circuito',
  'header.docs': 'Docs',
  'header.github': 'GitHub',
  'header.settings': 'Configuración y enlaces',

  // Panel titles
  'panel.editor.title': 'Editor de QuantumJS',
  'panel.qasm.title': 'QASM 3.0 generado',
  'panel.results.title': 'Probabilidades',
  'panel.results.titleWithMoment': 'Probabilidades — {moment}',
  'panel.circuit.title': 'Visor del circuito',
  'panel.explorer.title': 'Explorador',
  'panel.explorer.close': 'Cerrar explorador',
  'panel.focus': 'Enfocar panel',

  // Results / moments
  'results.moment': 'Momento {current} / {total}',
  'results.simulating': 'Simulando...',
  'results.runToSee': 'Ejecuta para ver los resultados',

  // States / empty views
  'state.waitingQasm': 'Esperando QASM...',
  'state.openFile': 'Abrir archivo...',
  'state.noSamples': 'No se encontraron ejemplos',
  'state.tapPanel': 'Toca la cabecera de un panel para abrirlo.',

  // Content actions
  'action.copyCode': 'Copiar código',
  'action.downloadCode': 'Descargar código',
  'action.copyQasm': 'Copiar QASM',
  'action.downloadQasm': 'Descargar QASM',
  'action.copyResults': 'Copiar probabilidades (CSV)',
  'action.downloadResults': 'Descargar probabilidades (CSV)',
  'action.copySvg': 'Copiar SVG',
  'action.downloadSvg': 'Descargar SVG',

  // Visualizer fit/zoom
  'visualizer.fitBoth': 'Ajustar todo',
  'visualizer.fitWidth': 'Ajustar al ancho',
  'visualizer.fitHeight': 'Ajustar al alto',
  'visualizer.manualZoom': 'Zoom manual',
  'visualizer.zoomIn': 'Acercar',
  'visualizer.zoomOut': 'Alejar',

  // WebMCP dialog (UI chrome only; tool names/descriptions stay as provided)
  'webmcp.title': 'Herramientas WebMCP',
  'webmcp.close': 'Cerrar',
  'webmcp.subtitle':
    'Herramientas disponibles que los agentes de IA pueden descubrir y usar',
  'webmcp.available': 'Herramientas disponibles',
  'webmcp.unavailable': 'No hay herramientas disponibles',
  'webmcp.noneRegistered': 'No hay herramientas registradas',
  'webmcp.noneRegisteredHint':
    'Las herramientas aparecerán aquí cuando se registren con WebMCP.',
  'webmcp.noDescription': 'Sin descripción',
  'webmcp.viewSchema': 'Ver esquema',
  'webmcp.tryAsking': 'Prueba a preguntar',
  'webmcp.footer':
    'Las herramientas operan en este espacio de trabajo del navegador. No se sincronizan datos con servidores.',
  'webmcp.loadError':
    'No se pudieron cargar las herramientas disponibles. Es posible que la API de Contexto de Modelo no esté disponible.',

  // WebMCP example prompts
  'webmcp.prompt.qft': 'Compila y simula un circuito cuántico con QFT',
  'webmcp.prompt.listSamples': 'Enumera todos los ejemplos cuánticos disponibles',
  'webmcp.prompt.openQft': 'Abre el ejemplo de QFT y ejecútalo',
  'webmcp.prompt.diagram':
    'Muéstrame un diagrama del circuito para el código actual',
  'webmcp.prompt.createDoc':
    'Crea un documento nuevo que explique las compuertas cuánticas',
  'webmcp.prompt.listDocs': 'Enumera mis documentos y resume los recientes',

  // Bench-originated errors
  'error.mustReturnCircuit':
    "El código debe devolver un objeto Quantum.Circuit (p. ej., 'return c;').",
  'error.simulation': 'Error de simulación:',
};
